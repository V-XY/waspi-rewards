import 'server-only';
import crypto from 'node:crypto';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
import { audit } from '@/app/lib/domain/audit/service';
import { RulesKycProvider } from '@/app/lib/providers/kyc/rules';

function hashToken(token: string) { return crypto.createHash('sha256').update(token).digest('hex'); }

export async function createKycAccessSession(tenantId: string, orderId: string) {
  const { data: order, error } = await supabaseAdmin.from('orders').select('id, customer_id').eq('id', orderId).eq('tenant_id', tenantId).single();
  if (error || !order) throw new Error('ORDER_NOT_FOUND');
  const token = crypto.randomBytes(32).toString('base64url');
  const { error: insertError } = await supabaseAdmin.from('kyc_access_sessions').insert({ tenant_id: tenantId, order_id: orderId, customer_id: order.customer_id, token_hash: hashToken(token), expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() });
  if (insertError) throw insertError;
  return token;
}

export async function getKycSession(token: string) {
  const { data, error } = await supabaseAdmin.from('kyc_access_sessions').select('*, orders(*), kyc_submissions(*)').eq('token_hash', hashToken(token)).is('revoked_at', null).gt('expires_at', new Date().toISOString()).maybeSingle();
  if (error || !data) throw new Error('INVALID_KYC_SESSION');
  const submission = Array.isArray(data.kyc_submissions) ? data.kyc_submissions[0] : data.kyc_submissions;
  if (submission?.id) {
    const { data: documents } = await supabaseAdmin.from('kyc_documents').select('*').eq('kyc_submission_id', submission.id);
    submission.kyc_documents = await Promise.all((documents || []).map(async (doc) => {
      const signed = await supabaseAdmin.storage
        .from(doc.storage_bucket || 'kyc-documents')
        .createSignedUrl(doc.storage_path, 300);
      return { ...doc, signed_url: signed.data?.signedUrl || null };
    }));
    data.kyc_submissions = [submission];
  }
  return data;
}

export async function saveKycSubmission(input: { tenantId: string; orderId: string; idType: string; documents: Array<{ documentType: string; storagePath: string; mimeType?: string; fileSize?: number }>; }) {
  const { data: submission, error } = await supabaseAdmin.from('kyc_submissions').update({ id_type: input.idType, status: input.documents.length >= 7 ? 'validating' : 'draft', submitted_at: input.documents.length >= 7 ? new Date().toISOString() : null }).eq('order_id', input.orderId).eq('tenant_id', input.tenantId).select().single();
  if (error || !submission) throw error || new Error('KYC_NOT_FOUND');
  if (input.documents.length) {
    await supabaseAdmin.from('kyc_documents').upsert(input.documents.map(d => ({ kyc_submission_id: submission.id, document_type: d.documentType, storage_path: d.storagePath, mime_type: d.mimeType || null, file_size: d.fileSize || null })), { onConflict: 'kyc_submission_id,document_type' });
  }
  if (submission.status === 'validating') {
    const { data: existingDocs } = await supabaseAdmin.from('kyc_documents').select('document_type,mime_type,file_size').eq('kyc_submission_id', submission.id);
    const provider = new RulesKycProvider();
    const validation = await provider.validate({
      idType: input.idType,
      documents: (existingDocs ?? []).map((doc) => ({
        documentType: String(doc.document_type),
        mimeType: doc.mime_type ?? undefined,
        fileSize: doc.file_size ?? undefined,
      })),
    });
    if (validation.decision === 'approved') {
      await supabaseAdmin.from('orders').update({ status: 'awaiting_payment' }).eq('id', input.orderId);
      await supabaseAdmin.from('kyc_submissions').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', submission.id);
    } else {
      await supabaseAdmin.from('kyc_submissions').update({ status: validation.decision }).eq('id', submission.id);
    }
  }
  await audit({ tenantId: input.tenantId, action: 'kyc.submitted', resourceType: 'kyc_submission', resourceId: submission.id, after: submission });
  return submission;
}
