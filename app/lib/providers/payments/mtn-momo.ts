import 'server-only';
import { serverConfig } from '@/app/lib/config/env';
import type { PaymentProvider, PaymentInitiationInput, PaymentInitiationResult } from './types';

/**
 * MTN MoMo Collections adapter boundary.
 * The sandbox/production credential contract must be filled from MTN's official
 * documentation for the subscribed market before enabling live initiation.
 */
export class MTNMoMoProvider implements PaymentProvider {
  readonly name = 'mtn_momo_api';
  async initiate(input: PaymentInitiationInput): Promise<PaymentInitiationResult> {
    void input;
    if (!serverConfig.momo.subscriptionKey || !serverConfig.momo.apiUser || !serverConfig.momo.apiKey) {
      throw new Error('MTN_MOMO_API_NOT_CONFIGURED');
    }
    throw new Error('MTN_MOMO_COLLECTION_ADAPTER_NOT_ENABLED');
  }
}
