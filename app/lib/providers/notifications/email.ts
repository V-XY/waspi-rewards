import type { NotificationProvider, NotificationInput, NotificationResult } from './types';
export class EmailNotificationProvider implements NotificationProvider { readonly name='email'; async send(input:NotificationInput):Promise<NotificationResult>{ return {provider:this.name,status:'queued'}; } }
