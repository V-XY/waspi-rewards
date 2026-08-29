// app/lib/utils/whatsapp-templates.ts

export function generateKYCCorrectionMessage(
  clientName: string,
  orderNumber: string,
  rejectionStep: string,
  rejectionReason: string,
  correctionLink: string,
  attemptNumber: number,
  maxAttempts: number = 3
): string {
  const stepLabel = formatRejectionStep(rejectionStep);

  return `
📋 KYC Update - Order #${orderNumber}

Dear ${clientName},

Thank you for submitting your KYC documents for your order.

We have reviewed your submission and identified the following issue:

Step: ${stepLabel}
Reason: ${rejectionReason}

To resolve this, please update the ${stepLabel.toLowerCase()} using the link below. Only the rejected step needs to be corrected.

🔗 ${correctionLink}

Once corrected, we will complete the verification and proceed with your order.

Please note: This is attempt ${attemptNumber} of ${maxAttempts}. After ${maxAttempts} attempts, we will need to schedule a manual verification.

If you have any questions, please reply to this message.

Regards,
EBU Flow team
EBU Flow support
---
This is an automated message from EBU Flow. Do not reply to this automated message.
If you need assistance, please contact your assigned support representative.
`;
}

export function generatePaymentConfirmationMessage(
  clientName: string,
  orderNumber: string,
  amount: number
): string {
  return `
✅ Payment Confirmed - Order #${orderNumber}

Dear ${clientName},

We have successfully received your payment of ${amount.toLocaleString()} FCFA for your order.

Your order is now being processed. We will notify you once your device is configured and ready for delivery.

Estimated delivery: 2-3 business days.

If you have any questions, please reply to this message.

Regards,
EBU Flow team
EBU Flow support
---
This is an automated message from EBU Flow. Do not reply to this automated message.
`;
}

export function generateDeliveryUpdateMessage(
  clientName: string,
  orderNumber: string,
  deliveryStatus: string,
  scheduledDate?: string
): string {
  return `
🚚 Delivery Update - Order #${orderNumber}

Dear ${clientName},

Your order is ${deliveryStatus}.

${scheduledDate ? `Scheduled delivery date: ${scheduledDate}` : ''}

Please ensure someone is available at the delivery address to receive the device.

If you need to reschedule, please reply to this message.

Regards,
EBU Flow team
EBU Flow support
---
This is an automated message from EBU Flow. Do not reply to this automated message.
`;
}

export function generateOrderReadyMessage(
  clientName: string,
  orderNumber: string,
  pickupLocation?: string
): string {
  return `
📦 Order Ready - Order #${orderNumber}

Dear ${clientName},

Your order is now ready for delivery.

${pickupLocation ? `Please pick up at: ${pickupLocation}` : 'We will deliver to your registered address.'}

Please ensure someone is available to receive the package.

If you have any questions, please reply to this message.

Regards,
EBU Flow team
EBU Flow support
---
This is an automated message from EBU Flow. Do not reply to this automated message.
`;
}

export function generateKYCReminderMessage(
  clientName: string,
  orderNumber: string,
  kycLink: string
): string {
  return `
⏰ KYC Reminder - Order #${orderNumber}

Dear ${clientName},

We noticed you haven't completed your KYC verification yet.

Please complete your KYC verification using the link below to proceed with your order.

🔗 ${kycLink}

This process takes less than 5 minutes.

If you have any questions, please reply to this message.

Regards,
EBU Flow team
EBU Flow support
---
This is an automated message from EBU Flow. Do not reply to this automated message.
`;
}

export function generateWelcomeMessage(
  clientName: string,
  orderNumber: string
): string {
  return `
👋 Welcome to EBU Flow!

Dear ${clientName},

Thank you for choosing EBU Flow. Your order #${orderNumber} has been received.

We will keep you updated on the status of your order.

Next steps:
1. Complete KYC verification (you will receive a separate link)
2. Payment confirmation
3. Device configuration
4. Delivery

If you have any questions, please reply to this message.

Regards,
EBU Flow team
EBU Flow support
---
This is an automated message from EBU Flow. Do not reply to this automated message.
`;
}

function formatRejectionStep(step: string): string {
  const map: Record<string, string> = {
    'id_type': 'ID Type Selection',
    'face_id_front': 'Face + ID Photo (Front)',
    'face_id_back': 'Face + ID Photo (Back)',
    'id_card_front': 'ID Card Photo (Front)',
    'id_card_back': 'ID Card Photo (Back)',
    'signature_1': 'Signature 1',
    'signature_2': 'Signature 2',
    'signature_3': 'Signature 3',
  };
  return map[step] || step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}