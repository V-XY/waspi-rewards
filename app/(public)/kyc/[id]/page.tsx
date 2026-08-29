'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { IDUploader } from '@/app/components/kyc/IDUploader';
import { SignatureCanvas } from '@/app/components/kyc/SignatureCanvas';
import type { KycSubmission, Order } from '@/app/lib/types';

type Step = 1 | 2 | 3 | 4;
type DocumentState = { file?: File; dataUrl?: string };
type KycForm = { id_type: string; face_front: DocumentState; face_back: DocumentState; id_front: DocumentState; id_back: DocumentState; signatures: [string, string, string] };

type SessionPayload = { orders?: Order; kyc_submissions?: Array<KycSubmission> | KycSubmission };

const initialForm: KycForm = { id_type: 'national_id', face_front: {}, face_back: {}, id_front: {}, id_back: {}, signatures: ['', '', ''] };

export default function KYCPage() {
  const { id: token } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [form, setForm] = useState<KycForm>(initialForm);
  const [step, setStep] = useState<Step>(1);
  const [completed, setCompleted] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(`/api/kyc/sessions?token=${encodeURIComponent(token)}`, { cache: 'no-store' });
        const payload = await response.json() as { error?: string; session?: SessionPayload };
        if (!response.ok || !payload.session?.orders) throw new Error(payload.error ?? 'Invalid KYC session');
        if (cancelled) return;
        setOrder(payload.session.orders);
        const submission = Array.isArray(payload.session.kyc_submissions) ? payload.session.kyc_submissions[0] : payload.session.kyc_submissions;
        const docs = submission?.kyc_documents ?? [];
        const find = (type: string) => docs.find((doc) => doc.document_type === type)?.signed_url ?? '';
        const next: KycForm = {
          id_type: submission?.id_type ?? 'national_id',
          face_front: { dataUrl: find('face_id_front') },
          face_back: { dataUrl: find('face_id_back') },
          id_front: { dataUrl: find('id_front') },
          id_back: { dataUrl: find('id_back') },
          signatures: [find('signature_1'), find('signature_2'), find('signature_3')],
        };
        setForm(next);
        const done: number[] = [];
        if (next.id_type) done.push(1);
        if (next.face_front.dataUrl && next.face_back.dataUrl) done.push(2);
        if (next.id_front.dataUrl && next.id_back.dataUrl) done.push(3);
        if (next.signatures.every(Boolean)) done.push(4);
        setCompleted(done);
        setStep((Math.min(Math.max(done.length + 1, 1), 4) as Step));
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : 'This KYC link is invalid or expired');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [token]);

  const dataUrlToFile = (dataUrl: string, name: string): File | null => {
    if (!dataUrl.startsWith('data:')) return null;
    const [meta, data] = dataUrl.split(',');
    if (!data) return null;
    const mime = meta.match(/data:(.*?);/)?.[1] ?? 'image/png';
    const bytes = atob(data);
    const buffer = new Uint8Array(bytes.length);
    for (let index = 0; index < bytes.length; index += 1) buffer[index] = bytes.charCodeAt(index);
    return new File([buffer], name, { type: mime });
  };

  const save = async (submit: boolean) => {
    setSaving(true);
    try {
      const body = new FormData();
      body.append('token', token);
      body.append('id_type', form.id_type);
      if (form.face_front.file) body.append('face_id_front', form.face_front.file);
      if (form.face_back.file) body.append('face_id_back', form.face_back.file);
      if (form.id_front.file) body.append('id_front', form.id_front.file);
      if (form.id_back.file) body.append('id_back', form.id_back.file);
      form.signatures.forEach((signature, index) => {
        const file = dataUrlToFile(signature, `signature_${index + 1}.png`);
        if (file) body.append(`signature_${index + 1}`, file);
      });

      const response = await fetch('/api/kyc/upload', { method: 'POST', body });
      const payload = await response.json() as { error?: string; submission?: KycSubmission };
      if (!response.ok) throw new Error(payload.error ?? 'Unable to save KYC');

      if (submit) {
        toast.success(payload.submission?.status === 'approved' ? 'Verification approved' : 'Verification submitted for review');
        if (order) router.push(`/track/${order.id}`);
      } else toast.success('Progress saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save KYC');
    } finally {
      setSaving(false);
    }
  };

  const canAdvance = useMemo(() => {
    if (step === 1) return Boolean(form.id_type);
    if (step === 2) return Boolean(form.face_front.dataUrl && form.face_back.dataUrl);
    if (step === 3) return Boolean(form.id_front.dataUrl && form.id_back.dataUrl);
    return form.signatures.every(Boolean);
  }, [form, step]);

  const markAndAdvance = async () => {
    if (!canAdvance) { toast.error('Complete this step before continuing'); return; }
    await save(false);
    setCompleted((current) => current.includes(step) ? current : [...current, step]);
    if (step < 4) setStep((step + 1) as Step);
  };

  if (loading) return <div className="site-container grid min-h-[70vh] place-items-center text-sm text-slate-500">Loading secure verification...</div>;
  if (!order) return <div className="site-container py-20"><h1 className="text-2xl font-bold text-midnight">Verification session unavailable</h1></div>;

  return <div className="bg-slate-50 py-8 md:py-12"><div className="site-container max-w-4xl"><div className="flex items-center gap-3"><button type="button" onClick={() => router.back()} className="icon-button"><ArrowLeft className="h-5 w-5" /></button><div><p className="eyebrow">Secure verification</p><h1 className="mt-1 text-2xl font-bold text-midnight sm:text-3xl">Verify your identity</h1></div></div><div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm text-slate-600"><div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-solar-flare"/><p>Order <strong>{order.order_number}</strong>. Your documents are uploaded to a private storage flow and are not stored as base64 data in the database.</p></div></div><div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5"><div className="flex gap-2 overflow-x-auto">{(['ID type','Face photos','ID photos','Signatures']).map((label,index) => <button type="button" key={label} onClick={() => completed.includes(index + 1) && setStep((index + 1) as Step)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold ${step === index + 1 ? 'bg-solar-flare text-white' : completed.includes(index + 1) ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{completed.includes(index + 1) ? '✓ ' : `${index + 1}. `}{label}</button>)}</div></div>

  <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">{step === 1 && <div><h2 className="text-xl font-semibold text-midnight">Identity document</h2><p className="mt-1 text-sm text-slate-500">Select the document you will use for verification.</p><label className="mt-6 block text-sm font-semibold text-midnight">Document type<select value={form.id_type} onChange={(event) => setForm((current) => ({ ...current, id_type: event.target.value }))} className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-solar-flare"><option value="national_id">National ID</option><option value="passport">Passport</option><option value="driving_license">Driving license</option></select></label></div>}{step === 2 && <div><h2 className="text-xl font-semibold text-midnight">Face and ID photos</h2><p className="mt-1 text-sm text-slate-500">Use clear photos with the document fully visible.</p><div className="mt-6 grid gap-6 md:grid-cols-2"><IDUploader label="Face + ID front" description="Hold your ID beside your face." type="face_front" initialValue={form.face_front.dataUrl} onUpload={(file,dataUrl) => setForm((current) => ({ ...current, face_front: { file, dataUrl } }))}/><IDUploader label="Face + ID back" description="Show the reverse side clearly." type="face_back" initialValue={form.face_back.dataUrl} onUpload={(file,dataUrl) => setForm((current) => ({ ...current, face_back: { file, dataUrl } }))}/></div></div>}{step === 3 && <div><h2 className="text-xl font-semibold text-midnight">Document photos</h2><p className="mt-1 text-sm text-slate-500">Upload the front and back of the selected identity document.</p><div className="mt-6 grid gap-6 md:grid-cols-2"><IDUploader label="Document front" type="id_front" initialValue={form.id_front.dataUrl} onUpload={(file,dataUrl) => setForm((current) => ({ ...current, id_front: { file, dataUrl } }))}/><IDUploader label="Document back" type="id_back" initialValue={form.id_back.dataUrl} onUpload={(file,dataUrl) => setForm((current) => ({ ...current, id_back: { file, dataUrl } }))}/></div></div>}{step === 4 && <div><h2 className="text-xl font-semibold text-midnight">Signatures</h2><p className="mt-1 text-sm text-slate-500">Provide the required signatures. Draw naturally inside each field.</p><div className="mt-6 grid gap-6 md:grid-cols-3">{form.signatures.map((signature,index) => <SignatureCanvas key={index} label={`Signature ${index + 1}`} initialValue={signature} onSignature={(value) => setForm((current) => { const signatures: [string,string,string] = [...current.signatures] as [string,string,string]; signatures[index] = value; return { ...current, signatures }; })}/>)}</div></div>}
  <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={() => setStep((Math.max(step - 1, 1) as Step))} disabled={step === 1 || saving} className="btn-secondary disabled:opacity-40">Back</button>{step < 4 ? <button type="button" onClick={() => void markAndAdvance()} disabled={saving} className="btn-primary">{saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <>{'Continue'} <ArrowRight className="h-4 w-4"/></>}</button> : <button type="button" onClick={() => void save(true)} disabled={saving || !canAdvance} className="btn-primary">{saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <><CheckCircle2 className="h-4 w-4"/> Submit verification</>}</button>}</div></section></div></div>;
}
