import type { NotificationProvider, NotificationInput, NotificationResult } from './types';
export class WhatsAppNotificationProvider implements NotificationProvider { readonly name='whatsapp'; async send(input:NotificationInput):Promise<NotificationResult>{ return {provider:this.name,status:'queued'}; } }
