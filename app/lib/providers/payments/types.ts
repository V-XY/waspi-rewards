export type PaymentProviderId = 'mtn_momo' | 'orange_money' | (string & {});

export type PaymentInitiationInput = {
  amount: number;
  currency: string;
  reference: string;
  metadata?: Record<string, unknown>;
};

export type PaymentInstruction =
  | {
      type: 'ussd';
      code: string;
      display: string;
      provider: PaymentProviderId;
      canOpenDialer: boolean;
    }
  | {
      type: 'account';
      accountNumber: string;
      accountName: string;
      provider: PaymentProviderId;
      display: string;
    };

export type PaymentInitiationResult = {
  provider: PaymentProviderId;
  status: 'pending' | 'processing';
  instructions?: PaymentInstruction;
  externalReference?: string;
};

export interface PaymentProvider {
  readonly name: PaymentProviderId;
  initiate(input: PaymentInitiationInput): Promise<PaymentInitiationResult>;
  getStatus?(externalReference: string): Promise<{ status: string; amount?: number; currency?: string }>;
}
