import 'server-only';
import type {
  PaymentInitiationInput,
  PaymentInitiationResult,
  PaymentProvider,
  PaymentProviderId,
} from './types';

export type ManualMerchantConfig = {
  provider: PaymentProviderId;
  accountNumber?: string | null;
  merchantCode?: string | null;
  displayName: string;
  ussdTemplate?: string | null;
};

function renderTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => String(values[key] ?? ''));
}

export class ManualMoneyProvider implements PaymentProvider {
  readonly name: PaymentProviderId;

  constructor(private readonly merchant: ManualMerchantConfig) {
    this.name = merchant.provider;
  }

  async initiate(input: PaymentInitiationInput): Promise<PaymentInitiationResult> {
    const amount = Math.round(input.amount);

    if (this.merchant.ussdTemplate) {
      const code = renderTemplate(this.merchant.ussdTemplate, {
        amount,
        merchant_code: this.merchant.merchantCode ?? '',
        account_number: this.merchant.accountNumber ?? '',
      });

      return {
        provider: this.name,
        status: 'pending',
        instructions: {
          type: 'ussd',
          code,
          display: code,
          provider: this.name,
          canOpenDialer: true,
        },
        externalReference: input.reference,
      };
    }

    if (this.merchant.accountNumber) {
      return {
        provider: this.name,
        status: 'pending',
        instructions: {
          type: 'account',
          accountNumber: this.merchant.accountNumber,
          accountName: this.merchant.displayName,
          provider: this.name,
          display: `${this.merchant.accountNumber} · ${this.merchant.displayName}`,
        },
        externalReference: input.reference,
      };
    }

    throw new Error('PAYMENT_DESTINATION_NOT_CONFIGURED');
  }
}
