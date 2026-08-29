// app/lib/utils/export-package.ts
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Order, CartItem } from '@/app/lib/types';

// ============================================
// Types & Interfaces
// ============================================

export interface KYCExportData {
  order: Order;
  idType: string;
  faceIdFrontUrl: string;
  faceIdBackUrl: string;
  idCardFrontUrl: string;
  idCardBackUrl: string;
  signature1Url: string;
  signature2Url: string;
  signature3Url: string;
  kycStatus?: string;
}

export interface ExportOptions {
  format: 'zip' | 'pdf';
  includeClientDetails: boolean;
  includePhotos: boolean;
  includeSignatures: boolean;
  compressionLevel?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  fileNamePrefix?: string;
}

export interface ExportResult {
  success: boolean;
  blob?: Blob;
  fileName?: string;
  error?: string;
  size?: number;
  duration?: number;
}

export interface PackageValidationResult {
  valid: boolean;
  missingFields: string[];
  fileSizeEstimate: number;
  warnings: string[];
}

// ============================================
// Configuration
// ============================================

const DEFAULT_OPTIONS: ExportOptions = {
  format: 'zip',
  includeClientDetails: true,
  includePhotos: true,
  includeSignatures: true,
  compressionLevel: 6,
  fileNamePrefix: 'KYC_Package',
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // milliseconds
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// ============================================
// Main Export Function
// ============================================

export async function generateKYCPackage(
  data: KYCExportData,
  options: ExportOptions = DEFAULT_OPTIONS
): Promise<ExportResult> {
  const startTime = Date.now();

  try {
    // 1. Validate input data
    const validation = validatePackageData(data);
    if (!validation.valid) {
      return {
        success: false,
        error: `Missing required fields: ${validation.missingFields.join(', ')}`,
      };
    }

    // 2. Merge options with defaults
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    // 3. Create ZIP
    const zip = new JSZip();

    // 4. Generate metadata
    const metadata = generateMetadata(data);
    zip.file('metadata.json', JSON.stringify(metadata, null, 2));

    // 5. Client details
    if (mergedOptions.includeClientDetails) {
      const clientDetails = generateClientDetails(data);
      zip.file('client_details.txt', clientDetails);

      const clientDetailsHTML = generateClientDetailsHTML(data);
      zip.file('client_details.html', clientDetailsHTML);
    }

    // 6. Face + ID Photos (with retry logic)
    if (mergedOptions.includePhotos) {
      const faceFront = await fetchWithRetry(data.faceIdFrontUrl);
      if (faceFront) {
        zip.file('1_Face_With_ID/face_id_front.jpg', faceFront);
      }

      const faceBack = await fetchWithRetry(data.faceIdBackUrl);
      if (faceBack) {
        zip.file('1_Face_With_ID/face_id_back.jpg', faceBack);
      }

      const idFront = await fetchWithRetry(data.idCardFrontUrl);
      if (idFront) {
        zip.file('2_ID_Card_Photos/id_front.jpg', idFront);
      }

      const idBack = await fetchWithRetry(data.idCardBackUrl);
      if (idBack) {
        zip.file('2_ID_Card_Photos/id_back.jpg', idBack);
      }
    }

    // 7. Signatures
    if (mergedOptions.includeSignatures) {
      const sig1 = await fetchWithRetry(data.signature1Url);
      if (sig1) {
        zip.file('3_Signatures/signature_1.png', sig1);
      }

      const sig2 = await fetchWithRetry(data.signature2Url);
      if (sig2) {
        zip.file('3_Signatures/signature_2.png', sig2);
      }

      const sig3 = await fetchWithRetry(data.signature3Url);
      if (sig3) {
        zip.file('3_Signatures/signature_3.png', sig3);
      }
    }

    // 8. Generate a summary file
    const summary = generateSummary(data);
    zip.file('SUMMARY.txt', summary);

    // 9. Generate ZIP
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: mergedOptions.compressionLevel ?? 6,
      },
    });

    // 10. Validate file size
    if (blob.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `Package size (${(blob.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum (${MAX_FILE_SIZE / 1024 / 1024}MB)`,
      };
    }

    // 11. Generate filename
    const fileName = generateFileName(data, mergedOptions);

    const duration = Date.now() - startTime;

    return {
      success: true,
      blob,
      fileName,
      size: blob.size,
      duration,
    };

  } catch (error) {
    console.error('Export package error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// ============================================
// Download Function
// ============================================

export async function downloadKYCPackage(
  data: KYCExportData,
  fileName?: string
): Promise<ExportResult> {
  const result = await generateKYCPackage(data);

  if (result.success && result.blob) {
    const downloadName = fileName || result.fileName || 'kyc_package.zip';
    saveAs(result.blob, downloadName);
  }

  return result;
}

// ============================================
// Validation Function
// ============================================

export function validatePackageData(data: KYCExportData): PackageValidationResult {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Check order fields
  if (!data.order?.order_number) {
    missingFields.push('order.order_number');
  }
  if (!data.order?.customer?.full_name) {
    missingFields.push('order.customer.full_name');
  }
  if (!data.order?.customer?.phone) {
    missingFields.push('order.customer.phone');
  }

  // Check KYC fields
  if (!data.idType) {
    warnings.push('idType not specified, defaulting to National ID');
  }

  // Check photo URLs
  if (!data.faceIdFrontUrl) {
    warnings.push('faceIdFrontUrl is missing');
  }
  if (!data.faceIdBackUrl) {
    warnings.push('faceIdBackUrl is missing');
  }
  if (!data.idCardFrontUrl) {
    warnings.push('idCardFrontUrl is missing');
  }
  if (!data.idCardBackUrl) {
    warnings.push('idCardBackUrl is missing');
  }

  // Check signatures
  if (!data.signature1Url) {
    warnings.push('signature1Url is missing');
  }
  if (!data.signature2Url) {
    warnings.push('signature2Url is missing');
  }
  if (!data.signature3Url) {
    warnings.push('signature3Url is missing');
  }

  // Estimate file size (rough estimate)
  let fileSizeEstimate = 1024; // 1KB for metadata and text files
  if (data.faceIdFrontUrl) fileSizeEstimate += 500 * 1024; // ~500KB per image
  if (data.faceIdBackUrl) fileSizeEstimate += 500 * 1024;
  if (data.idCardFrontUrl) fileSizeEstimate += 500 * 1024;
  if (data.idCardBackUrl) fileSizeEstimate += 500 * 1024;
  if (data.signature1Url) fileSizeEstimate += 50 * 1024; // ~50KB per signature
  if (data.signature2Url) fileSizeEstimate += 50 * 1024;
  if (data.signature3Url) fileSizeEstimate += 50 * 1024;

  return {
    valid: missingFields.length === 0,
    missingFields,
    fileSizeEstimate,
    warnings,
  };
}

// ============================================
// Helper Functions
// ============================================

async function fetchWithRetry(
  url: string,
  maxRetries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<Blob | null> {
  if (!url || url === '') {
    return null;
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Handle data URLs
      if (url.startsWith('data:')) {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.blob();
      }

      // Handle regular URLs
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('Empty file received');
      }

      return blob;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Fetch attempt ${attempt}/${maxRetries} failed for ${url}:`, lastError.message);

      if (attempt < maxRetries) {
        await sleep(delay * attempt);
      }
    }
  }

  console.error(`All ${maxRetries} fetch attempts failed for ${url}:`, lastError?.message);
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateMetadata(data: KYCExportData): Record<string, unknown> {
  return {
    order_number: data.order.order_number,
    client_name: data.order.customer?.full_name ?? 'Unknown customer',
    client_phone: data.order.customer?.phone ?? 'Unknown phone',
    client_email: data.order.customer?.email ?? null,
    created_at: new Date().toISOString(),
    exported_at: new Date().toISOString(),
    id_type: data.idType || 'National ID',
    kyc_status: data.kycStatus ?? 'unknown',
    product_count: data.order.order_items?.length || 0,
    total_amount: data.order.total_amount,
    net_amount: data.order.total_amount,
    has_face_id_front: !!data.faceIdFrontUrl,
    has_face_id_back: !!data.faceIdBackUrl,
    has_id_card_front: !!data.idCardFrontUrl,
    has_id_card_back: !!data.idCardBackUrl,
    has_signature_1: !!data.signature1Url,
    has_signature_2: !!data.signature2Url,
    has_signature_3: !!data.signature3Url,
    generated_by: 'EBU Flow',
    version: '1.0.0',
  };
}

function generateClientDetails(data: KYCExportData): string {
  const { order } = data;
  const products: CartItem[] = order.order_items?.map((item) => ({ product_id: item.product_id, name: item.product_name, price: item.unit_price, quantity: item.quantity, total: item.line_total })) || [];

  const lines = [
    '='.repeat(60),
    '    KYC SUBMISSION PACKAGE',
    `    Order #${order.order_number}`,
    '='.repeat(60),
    '',
    'Client Details:',
    '---------------',
    `Name:          ${order.customer?.full_name ?? 'Unknown customer'}`,
    `Phone:         ${order.customer?.phone ?? 'Unknown phone'}`,
    `Email:         ${order.customer?.email || 'Not provided'}`,
    `Address:       ${(order.customer?.address ?? order.delivery_address) || 'Not provided'}`,
    `Landmark:      ${(order.customer?.landmark ?? order.delivery_landmark) || 'Not provided'}`,
    '',
    'Order Details:',
    '--------------',
    `Order #:       ${order.order_number}`,
    `Date:          ${new Date(order.created_at).toLocaleDateString()}`,
    `Source:        ${order.source || 'direct'}`,
    `Notes:         ${order.notes || 'None'}`,
    '',
    'Products:',
    '---------',
  ];

  if (products.length === 0) {
    lines.push('  No products listed');
  } else {
    for (const product of products) {
      lines.push(`  - ${product.name} x${product.quantity} = ${product.total.toLocaleString()} FCFA`);
    }
  }

  lines.push(
    '',
    'Totals:',
    '--------',
    `Subtotal:      ${order.total_amount.toLocaleString()} FCFA`,
    `Discount:      ${order.discount_amount.toLocaleString()} FCFA`,
    `Net Amount:    ${order.total_amount.toLocaleString()} FCFA`,
    '',
    'KYC Details:',
    '------------',
    `ID Type:       ${data.idType || 'National ID'}`,
    `KYC Status:    ${data.kycStatus ?? 'unknown'}`,
    `Submitted:     ${new Date().toLocaleString()}`,
    '',
    '='.repeat(60),
    `    Generated by EBU Flow`,
    `    ${new Date().toLocaleString()}`,
    '='.repeat(60),
  );

  return lines.join('\n');
}

function generateClientDetailsHTML(data: KYCExportData): string {
  const { order } = data;
  const products: CartItem[] = order.order_items?.map((item) => ({ product_id: item.product_id, name: item.product_name, price: item.unit_price, quantity: item.quantity, total: item.line_total })) || [];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KYC Package - ${order.order_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); }
    h1 { font-size: 24px; color: #0B1121; border-bottom: 2px solid #FF6B35; padding-bottom: 12px; margin-bottom: 24px; }
    h2 { font-size: 18px; color: #0B1121; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    .label { font-weight: 600; color: #6B7280; }
    .value { color: #0B1121; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
    .grid-item { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f3f4f6; }
    .product-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .totals { margin-top: 16px; padding-top: 16px; border-top: 2px solid #e5e7eb; }
    .totals-item { display: flex; justify-content: space-between; padding: 4px 0; font-weight: 500; }
    .totals-total { font-size: 18px; color: #FF6B35; }
    .kyc-status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .status-verified { background: #D1FAE5; color: #065F46; }
    .status-submitted { background: #FEF3C7; color: #92400E; }
    .status-pending { background: #DBEAFE; color: #1E40AF; }
    .status-not_started { background: #F3F4F6; color: #6B7280; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 2px solid #FF6B35; text-align: center; font-size: 12px; color: #9CA3AF; }
    .missing { color: #EF4444; }
    .warning { color: #F59E0B; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📋 KYC Submission Package</h1>
    <p style="color: #6B7280; margin-bottom: 16px;">Order #${order.order_number}</p>

    <h2>Client Details</h2>
    <div class="grid">
      <div class="grid-item"><span class="label">Name</span><span class="value">${order.customer?.full_name ?? 'Unknown customer'}</span></div>
      <div class="grid-item"><span class="label">Phone</span><span class="value">${order.customer?.phone ?? 'Unknown phone'}</span></div>
      <div class="grid-item"><span class="label">Email</span><span class="value">${order.customer?.email || 'Not provided'}</span></div>
      <div class="grid-item"><span class="label">Address</span><span class="value">${(order.customer?.address ?? order.delivery_address) || 'Not provided'}</span></div>
      <div class="grid-item"><span class="label">Landmark</span><span class="value">${(order.customer?.landmark ?? order.delivery_landmark) || 'Not provided'}</span></div>
    </div>

    <h2>Order Details</h2>
    <div class="grid">
      <div class="grid-item"><span class="label">Order #</span><span class="value">${order.order_number}</span></div>
      <div class="grid-item"><span class="label">Date</span><span class="value">${new Date(order.created_at).toLocaleDateString()}</span></div>
      <div class="grid-item"><span class="label">Source</span><span class="value">${order.source || 'direct'}</span></div>
      <div class="grid-item"><span class="label">Notes</span><span class="value">${order.notes || 'None'}</span></div>
    </div>

    <h2>Products</h2>
    ${products.length === 0 ? '<p style="color: #6B7280;">No products listed</p>' : `
      ${products.map((p: CartItem) => `
        <div class="product-item">
          <span>${p.name} × ${p.quantity}</span>
          <span>${p.total.toLocaleString()} FCFA</span>
        </div>
      `).join('')}
      <div class="totals">
        <div class="totals-item"><span>Subtotal</span><span>${order.total_amount.toLocaleString()} FCFA</span></div>
        ${order.discount_amount > 0 ? `<div class="totals-item" style="color: #10B981;"><span>Discount</span><span>-${order.discount_amount.toLocaleString()} FCFA</span></div>` : ''}
        <div class="totals-item totals-total"><span>Total</span><span>${order.total_amount.toLocaleString()} FCFA</span></div>
      </div>
    `}

    <h2>KYC Details</h2>
    <div class="grid">
      <div class="grid-item"><span class="label">ID Type</span><span class="value">${data.idType || 'National ID'}</span></div>
      <div class="grid-item"><span class="label">Status</span><span class="value"><span class="kyc-status status-${data.kycStatus ?? 'unknown'}">${data.kycStatus ?? 'unknown'}</span></span></div>
      <div class="grid-item"><span class="label">Submitted</span><span class="value">${new Date().toLocaleString()}</span></div>
    </div>

    <h2>Attachments</h2>
    <div class="grid">
      <div class="grid-item"><span class="label">Face + ID (Front)</span><span class="value">${data.faceIdFrontUrl ? '✅' : '❌ Missing'}</span></div>
      <div class="grid-item"><span class="label">Face + ID (Back)</span><span class="value">${data.faceIdBackUrl ? '✅' : '❌ Missing'}</span></div>
      <div class="grid-item"><span class="label">ID Card (Front)</span><span class="value">${data.idCardFrontUrl ? '✅' : '❌ Missing'}</span></div>
      <div class="grid-item"><span class="label">ID Card (Back)</span><span class="value">${data.idCardBackUrl ? '✅' : '❌ Missing'}</span></div>
      <div class="grid-item"><span class="label">Signature 1</span><span class="value">${data.signature1Url ? '✅' : '❌ Missing'}</span></div>
      <div class="grid-item"><span class="label">Signature 2</span><span class="value">${data.signature2Url ? '✅' : '❌ Missing'}</span></div>
      <div class="grid-item"><span class="label">Signature 3</span><span class="value">${data.signature3Url ? '✅' : '❌ Missing'}</span></div>
    </div>

    <div class="footer">
      Generated by EBU Flow • ${new Date().toLocaleString()} • Version 1.0.0
    </div>
  </div>
</body>
</html>`;
}

function generateSummary(data: KYCExportData): string {
  const lines = [
    '='.repeat(70),
    '                    EBU FLOW - PACKAGE SUMMARY',
    '='.repeat(70),
    '',
    `Order Number:    ${data.order.order_number}`,
    `Client:          ${data.order.customer?.full_name ?? 'Unknown customer'}`,
    `Phone:           ${data.order.customer?.phone ?? 'Unknown phone'}`,
    `ID Type:         ${data.idType || 'National ID'}`,
    `KYC Status:      ${data.kycStatus ?? 'unknown'}`,
    `Generated:       ${new Date().toLocaleString()}`,
    '',
    'Attachments:',
    '------------',
    `Face + ID Front:  ${data.faceIdFrontUrl ? '✅ Included' : '❌ Missing'}`,
    `Face + ID Back:   ${data.faceIdBackUrl ? '✅ Included' : '❌ Missing'}`,
    `ID Card Front:    ${data.idCardFrontUrl ? '✅ Included' : '❌ Missing'}`,
    `ID Card Back:     ${data.idCardBackUrl ? '✅ Included' : '❌ Missing'}`,
    `Signature 1:      ${data.signature1Url ? '✅ Included' : '❌ Missing'}`,
    `Signature 2:      ${data.signature2Url ? '✅ Included' : '❌ Missing'}`,
    `Signature 3:      ${data.signature3Url ? '✅ Included' : '❌ Missing'}`,
    '',
    'Products:',
    '---------',
  ];

  const products: CartItem[] = data.order.order_items?.map((item) => ({ product_id: item.product_id, name: item.product_name, price: item.unit_price, quantity: item.quantity, total: item.line_total })) || [];
  if (products.length === 0) {
    lines.push('  No products listed');
  } else {
    for (const product of products) {
      lines.push(`  - ${product.name} x${product.quantity} = ${product.total.toLocaleString()} FCFA`);
    }
  }

  lines.push(
    '',
    'Totals:',
    '--------',
    `Total Amount:    ${data.order.total_amount.toLocaleString()} FCFA`,
    `Discount:        ${data.order.discount_amount.toLocaleString()} FCFA`,
    `Net Amount:      ${data.order.total_amount.toLocaleString()} FCFA`,
    '',
    '='.repeat(70),
    `Generated by EBU Flow v1.0.0`,
    '='.repeat(70),
  );

  return lines.join('\n');
}

function generateFileName(data: KYCExportData, options: ExportOptions): string {
  const prefix = options.fileNamePrefix || 'KYC_Package';
  const orderNum = data.order.order_number || 'UNKNOWN';
  const date = new Date().toISOString().split('T')[0];
  const ext = options.format === 'pdf' ? 'pdf' : 'zip';
  return `${prefix}_${orderNum}_${date}.${ext}`;
}