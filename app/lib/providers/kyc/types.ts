export type KycCheck = { name:string; passed:boolean; reason?:string };
export type KycValidationInput = { idType:string; documents:Array<{documentType:string;mimeType?:string;fileSize?:number}> };
export type KycValidationResult = { decision:'approved'|'manual_review'|'correction_required'; checks:KycCheck[] };
export interface KycProvider { readonly name:string; validate(input:KycValidationInput):Promise<KycValidationResult>; }
