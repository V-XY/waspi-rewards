import type { NotificationProvider, NotificationInput, NotificationResult } from './types';
export class SMSNotificationProvider implements NotificationProvider { readonly name='sms'; async send(input:NotificationInput):Promise<NotificationResult>{ return {provider:this.name,status:'queued'}; } }
