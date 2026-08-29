// app/(public)/contact/page.tsx
import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact EBU Flow — Sales Automation Platform',
  description: 'Contact EBU Flow for questions about the sales automation platform. Reach out by phone, email, or WhatsApp.',
  openGraph: {
    title: 'Contact EBU Flow — Sales Automation Platform',
    description: 'Contact EBU Flow for questions about the sales automation platform. Reach out by phone, email, or WhatsApp.',
    url: 'https://ebu-flow.vercel.app/contact',
    siteName: 'EBU Flow',
    type: 'website',
  },
  alternates: {
    canonical: 'https://ebu-flow.vercel.app/contact',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}