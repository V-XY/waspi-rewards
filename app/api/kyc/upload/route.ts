import { NextRequest, NextResponse } from 'next/server';
import { getKycSession, saveKycSubmission } from '@/app/lib/domain/kyc/service';
import { getDefaultTenant } from '@/app/lib/tenancy';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
import { handleRouteError } from '@/app/lib/http';

export async function POST(request: NextRequest) {
  try {
    const tenant=await getDefaultTenant();
    const form=await request.formData();
    const token=String(form.get('token')||'');
    const idType=String(form.get('id_type')||'');
    const session=await getKycSession(token);
    if(session.tenant_id!==tenant.id)throw new Error('INVALID_KYC_SESSION');
    const docs:string[]=['face_id_front','face_id_back','id_front','id_back','signature_1','signature_2','signature_3'];
    const uploaded=[];
    for(const type of docs){
      const file=form.get(type);
      if(!(file instanceof File))continue;
      if(file.size>10*1024*1024)throw new Error('FILE_TOO_LARGE');
      const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
      const path=`${tenant.id}/${session.order_id}/${type}.${ext}`;
      const bytes=Buffer.from(await file.arrayBuffer());
      const {error}=await supabaseAdmin.storage.from('kyc-documents').upload(path,bytes,{contentType:file.type||'image/jpeg',upsert:true});
      if(error)throw error;
      uploaded.push({documentType:type,storagePath:path,mimeType:file.type,fileSize:file.size});
    }
    const submission=await saveKycSubmission({tenantId:tenant.id,orderId:session.order_id,idType,documents:uploaded});
    return NextResponse.json({submission});
  }catch(e){return handleRouteError(e);}
}
