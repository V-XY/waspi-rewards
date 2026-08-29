// app/(public)/about/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ArrowRight, 
  Target, 
  Shield, 
  Sparkles, 
  TrendingUp,
  Users,
  FileCheck,
  Package,
  CreditCard,
  Truck,
  DollarSign,
  Eye
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About EBU Flow — Sales Automation Platform for Field Teams',
  description: 'EBU Flow is a sales automation platform built by a software engineer and MTN Business Brand Ambassador to help field teams manage leads, KYC, orders, payments, delivery, and commissions.',
  openGraph: {
    title: 'About EBU Flow — Sales Automation Platform for Field Teams',
    description: 'EBU Flow helps field teams manage their entire sales workflow. From lead capture to final delivery, everything in one place.',
    url: 'https://ebu-flow.vercel.app/about',
    siteName: 'EBU Flow',
    type: 'website'
  },
  alternates: {
    canonical: 'https://ebu-flow.vercel.app/about'
  }
};

const features = [
  {
    icon: Users,
    title: 'Lead Management',
    description: 'Capture and track leads from any source. Know where every lead stands, from first contact to conversion.'
  },
  {
    icon: FileCheck,
    title: 'KYC Verification',
    description: 'Digital identity verification with secure document storage. Fast, compliant, and audit-ready.'
  },
  {
    icon: Package,
    title: 'Order Processing',
    description: 'End-to-end order management with real-time status tracking. No more lost orders or manual follow-ups.'
  },
  {
    icon: CreditCard,
    title: 'Payment Coordination',
    description: 'Payment verification and reconciliation. Keep track of who has paid and who has not.'
  },
  {
    icon: Truck,
    title: 'Delivery Management',
    description: 'Coordinate and track device delivery. Know when items arrive and when they reach the customer.'
  },
  {
    icon: DollarSign,
    title: 'Commission Tracking',
    description: 'Automatic commission calculation and reporting. Know what you earned, when you earned it.'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      <section className="relative overflow-hidden bg-gradient-sunrise py-20 md:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            About EBU Flow
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            EBU Flow is a sales automation platform that&apos;s about helping field teams manage their entire sales workflow.
            From lead capture to final delivery, everything in one place.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-midnight mb-4">Why EBU Flow Exists</h2>
            <p className="text-lg text-warm-gray max-w-2xl mx-auto">
              To digitize and streamline sales processes so teams can focus on what matters: serving their customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-xl border border-warm-gray/10">
              <div className="w-14 h-14 bg-solar-flare/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-7 h-7 text-solar-flare" />
              </div>
              <h3 className="font-semibold text-midnight text-lg">Eliminate Manual Work</h3>
              <p className="text-sm text-warm-gray mt-2 leading-relaxed">
                Field agents spend too much time on paperwork and follow-ups. EBU Flow automates the repetitive parts.
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl border border-warm-gray/10">
              <div className="w-14 h-14 bg-ultramarine/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-ultramarine" />
              </div>
              <h3 className="font-semibold text-midnight text-lg">Standardize Processes</h3>
              <p className="text-sm text-warm-gray mt-2 leading-relaxed">
                Every lead, every KYC, every order follows the same workflow. No more missed steps or lost information.
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl border border-warm-gray/10">
              <div className="w-14 h-14 bg-ghost-green/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-midnight text-lg">Enable Growth</h3>
              <p className="text-sm text-warm-gray mt-2 leading-relaxed">
                When processes are digitized, teams can scale. EBU Flow is built to grow with your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-frost/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-midnight mb-4">What EBU Flow Does</h2>
            <p className="text-lg text-warm-gray max-w-2xl mx-auto">
              A platform that handles the entire sales workflow, from first contact to final delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-warm-gray/10 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-solar-flare/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-solar-flare" />
                </div>
                <h3 className="font-semibold text-midnight text-lg">{feature.title}</h3>
                <p className="text-sm text-warm-gray mt-2 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-midnight mb-4">Who Is EBU Flow For?</h2>
            <p className="text-lg text-warm-gray max-w-2xl mx-auto">
              Built for sales teams, field agents, and enterprises that need a reliable platform to manage their operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border border-warm-gray/10 rounded-xl">
              <div className="w-12 h-12 bg-solar-flare/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-solar-flare" />
              </div>
              <h3 className="font-semibold text-midnight">Sales Teams</h3>
              <p className="text-sm text-warm-gray mt-1">Keep track of leads, orders, and commissions in one place.</p>
            </div>
            <div className="text-center p-6 border border-warm-gray/10 rounded-xl">
              <div className="w-12 h-12 bg-ultramarine/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-ultramarine" />
              </div>
              <h3 className="font-semibold text-midnight">Field Agents</h3>
              <p className="text-sm text-warm-gray mt-1">Manage KYC, payments, and delivery without the paperwork.</p>
            </div>
            <div className="text-center p-6 border border-warm-gray/10 rounded-xl">
              <div className="w-12 h-12 bg-ghost-green/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-midnight">Enterprises</h3>
              <p className="text-sm text-warm-gray mt-1">Standardize workflows across teams and track performance.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 border-y border-warm-gray/10" aria-label="About the founder">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-warm-gray mb-2">Built by</p>
          <p className="text-midnight font-medium">Millenian N. Ngangmi</p>
          <p className="text-sm text-warm-gray mt-1 max-w-xl mx-auto">
            EBU Flow was built by Millenian N. Ngangmi, a software engineer and MTN Business Brand Ambassador.
            Seeing firsthand how much time field agents waste on manual processes, he built this platform to solve those problems for agents and for businesses with the same challenges.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-blue-frost py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-midnight mb-4">
            Ready to See How It Works?
          </h2>
          <p className="text-lg text-midnight/70 mb-8 max-w-2xl mx-auto">
            Explore the platform or get in touch to learn more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3 bg-solar-flare text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Explore Products
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-midnight font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 border border-warm-gray/20"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
