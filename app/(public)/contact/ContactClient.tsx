// app/(public)/contact/ContactClient.tsx
'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import emailjs from '@emailjs/browser';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactClient() {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

      if (!serviceId || !templateId || !publicKey) {
        console.warn('EmailJS not configured. Simulating email send...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success('Message sent successfully! (Demo mode)');
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setLoading(false);
        return;
      }

      const result = await emailjs.sendForm(
        serviceId,
        templateId,
        formRef.current!,
        publicKey
      );

      if (result.text === 'OK') {
        toast.success('Message sent successfully!');
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-xl border border-warm-gray/10 p-8 md:p-12">
          <div className="w-24 h-24 bg-ghost-green rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-midnight mb-2">Message Sent!</h2>
          <p className="text-warm-gray mb-6">
            Thank you for reaching out. We&apos;ll get back to you within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-3 bg-solar-flare text-white font-medium rounded-lg hover:bg-solar-flare/90 transition-colors"
            >
              Send Another Message
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-white border border-warm-gray/30 text-midnight font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-midnight">Contact Us</h1>
          <p className="text-lg text-warm-gray mt-3 max-w-2xl mx-auto">
            Have questions? We&apos;re here to help. Reach out to us through any of the channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-warm-gray/10 p-6">
              <h2 className="font-semibold text-midnight text-lg mb-4">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 group">
                  <div className="w-10 h-10 bg-solar-flare/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-solar-flare/20 transition-colors">
                    <Phone className="w-5 h-5 text-solar-flare" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-warm-gray uppercase tracking-wider">Phone</p>
                    <a href="tel:+237676648875" className="text-sm font-medium text-midnight hover:text-solar-flare transition-colors">
                      +237 676 648 875
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="w-10 h-10 bg-ultramarine/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-ultramarine/20 transition-colors">
                    <Mail className="w-5 h-5 text-ultramarine" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-warm-gray uppercase tracking-wider">Email</p>
                    <a href="mailto:millenianngu@gmail.com" className="text-sm font-medium text-midnight hover:text-ultramarine transition-colors">
                      millenianngu@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-warm-gray uppercase tracking-wider">Location</p>
                    <p className="text-sm font-medium text-midnight">Douala, Cameroon</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="w-10 h-10 bg-warm-gray/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-warm-gray/20 transition-colors">
                    <Clock className="w-5 h-5 text-warm-gray" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-warm-gray uppercase tracking-wider">Business Hours</p>
                    <p className="text-sm font-medium text-midnight">Mon - Fri: 9 AM - 6 PM</p>
                    <p className="text-xs text-warm-gray">Weekends: By Appointment</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-sunrise rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="w-6 h-6" />
                <span className="font-semibold">Chat with Us</span>
              </div>
              <p className="text-sm text-white/80 mb-4">
                Prefer instant messaging? Connect with us on WhatsApp.
              </p>
              <a
                href="https://wa.me/237676648875?text=Hello!%20I%20need%20help%20with%20EBU%20Flow."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-solar-flare font-medium rounded-lg hover:bg-white/90 transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Start WhatsApp Chat
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-warm-gray/10 p-6 md:p-8">
              <h2 className="font-semibold text-midnight text-lg mb-6">Send a Message</h2>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-midnight mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-warm-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-solar-flare focus:border-transparent bg-white text-midnight placeholder:text-warm-gray/60 transition-shadow"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-midnight mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-warm-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-solar-flare focus:border-transparent bg-white text-midnight placeholder:text-warm-gray/60 transition-shadow"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-midnight mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-warm-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-solar-flare focus:border-transparent bg-white text-midnight placeholder:text-warm-gray/60 transition-shadow"
                      placeholder="6XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-midnight mb-1.5">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-warm-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-solar-flare focus:border-transparent bg-white text-midnight appearance-none transition-shadow"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="products">Product Information</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership / Collaboration</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight mb-1.5">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-warm-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-solar-flare focus:border-transparent bg-white text-midnight placeholder:text-warm-gray/60 resize-none transition-shadow"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-solar-flare text-white font-semibold rounded-lg hover:bg-solar-flare/90 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-xs text-warm-gray text-center">
                  By submitting this form, you agree to our Privacy Policy.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
