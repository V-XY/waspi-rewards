'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/app/lib/supabase/client';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [loading,setLoading]=useState(false); const [error,setError]=useState(''); const [showPassword,setShowPassword]=useState(false);
  const callbackUrl=searchParams.get('callbackUrl')||'/dashboard';
  useEffect(()=>{supabase.auth.getUser().then(({data})=>{if(data.user)router.replace(callbackUrl);});},[router,callbackUrl]);
  async function handleSubmit(e:React.FormEvent){e.preventDefault();setLoading(true);setError('');const {error}=await supabase.auth.signInWithPassword({email,password});if(error){setError('Invalid email or password. Please try again.');toast.error('Invalid email or password');}else{toast.success('Welcome back!');router.replace(callbackUrl);}setLoading(false);}
  return <div className="max-w-md w-full bg-white dark:bg-ebony rounded-2xl shadow-lg border border-warm-gray/10 dark:border-white/5 p-8">
    <div className="text-center mb-8"><Link href="/" className="inline-flex items-center gap-2"><div className="w-10 h-10 bg-gradient-sunrise rounded-lg flex items-center justify-center"><span className="text-white font-bold text-lg">E</span></div><span className="font-bold text-midnight dark:text-white text-xl">EBU <span className="text-solar-flare">Flow</span></span></Link><h1 className="text-2xl font-bold text-midnight dark:text-white mt-6">Welcome Back</h1><p className="text-sm text-warm-gray mt-2">Authorized operators only</p></div>
    {error&&<div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 rounded-lg flex gap-2 text-sm text-red-600"><AlertCircle className="w-4 h-4"/><span>{error}</span></div>}
    <form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-sm font-medium mb-1.5">Email Address</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray"/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 border border-warm-gray/30 rounded-lg bg-transparent" placeholder="you@example.com"/></div></div><div><label className="block text-sm font-medium mb-1.5">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray"/><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required className="w-full pl-10 pr-12 py-3 border border-warm-gray/30 rounded-lg bg-transparent"/><button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">{showPassword?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div></div><button disabled={loading} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-solar-flare text-white font-semibold rounded-lg disabled:opacity-50">{loading?'Signing in...':<>Sign In<ArrowRight className="w-4 h-4"/></>}</button></form>
    <p className="text-xs text-warm-gray text-center mt-6">Access is provisioned by an administrator. There is no public operator sign-up.</p>
  </div>;
}
export default function SignInPage(){return <div className="min-h-screen bg-gray-50 dark:bg-midnight flex items-center justify-center py-12 px-4"><Suspense fallback={<div>Loading...</div>}><SignInForm/></Suspense></div>}
