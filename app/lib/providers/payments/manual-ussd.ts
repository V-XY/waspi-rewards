import 'server-only';
import { ManualMoneyProvider, type ManualMerchantConfig } from './manual-money';

export type MerchantConfig = Omit<ManualMerchantConfig, 'provider'>;

export class ManualUSSDProvider extends ManualMoneyProvider {
  constructor(merchant: MerchantConfig) {
    super({ ...merchant, provider: 'mtn_momo' });
  }
}
