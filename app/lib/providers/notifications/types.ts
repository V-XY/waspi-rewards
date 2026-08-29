export type NotificationInput = { recipient:string; message:string; template?:string; metadata?:Record<string,unknown> };
export type NotificationResult = { provider:string; messageId?:string; status:'queued'|'sent'|'failed' };
export interface NotificationProvider { readonly name:string; send(input:NotificationInput):Promise<NotificationResult>; }
