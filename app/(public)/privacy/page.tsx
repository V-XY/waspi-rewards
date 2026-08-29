// app/(public)/privacy/page.tsx
'use client';


export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-warm-gray/10 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-midnight mb-6">Privacy Policy</h1>
          <p className="text-sm text-warm-gray mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-sm text-midnight/80 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">1. Introduction</h2>
              <p>
                EBU Flow (hereafter referred to as &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our platform.
              </p>
              <p className="mt-2">
                EBU Flow is a service provided by Millenian N. Ngangmi, an authorized MTN Business Brand Ambassador. We act as a facilitator between customers and MTN Business products and services.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">2. Information We Collect</h2>
              <p>We collect the following types of information:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>
                  <span className="font-medium">Personal Information:</span> Name, phone number, email address, physical address, landmark
                </li>
                <li>
                  <span className="font-medium">Identification Documents:</span> Government-issued ID (National ID, Driver&apos;s License, Passport), photos of ID documents, face+ID verification photos
                </li>
                <li>
                  <span className="font-medium">Order Information:</span> Products purchased, order history, payment confirmations
                </li>
                <li>
                  <span className="font-medium">Technical Data:</span> IP address, browser type, device information, cookies
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">3. How We Use Your Information</h2>
              <p>Your information is used for:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>Processing and fulfilling your orders</li>
                <li>KYC (Know Your Customer) verification as required by MTN Business regulations</li>
                <li>Communicating with you about your orders and updates</li>
                <li>Improving our services and user experience</li>
                <li>Complying with legal and regulatory requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">4. Data Sharing</h2>
              <p>We share your information with:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>
                  <span className="font-medium">MTN Business:</span> For order processing, activation, and delivery
                </li>
                <li>
                  <span className="font-medium">Delivery Partners:</span> To coordinate delivery of your products
                </li>
                <li>
                  <span className="font-medium">Service Providers:</span> Supabase (data storage), WhatsApp (communication), Google Maps (address services)
                </li>
                <li>
                  <span className="font-medium">Law Enforcement:</span> When required by law or to protect our rights
                </li>
              </ul>
              <p className="mt-2">
                We do not sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">5. Data Storage & Security</h2>
              <p>
                Your data is stored securely using:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>Supabase (secure cloud database)</li>
                <li>Encryption for data transmission (HTTPS)</li>
                <li>Access controls to protect your information</li>
              </ul>
              <p className="mt-2">
                We implement appropriate security measures to protect your data from unauthorized access, alteration, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">6. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>Fulfill your orders and provide services</li>
                <li>Comply with MTN Business and legal requirements</li>
                <li>Resolve disputes or enforce our agreements</li>
              </ul>
              <p className="mt-2">
                KYC data is retained in accordance with MTN Business regulations and may be kept for several years as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Withdraw consent for data processing</li>
                <li>Object to certain types of processing</li>
              </ul>
              <p className="mt-2">
                To exercise these rights, please contact us using the details below.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">8. Cookies</h2>
              <p>
                EBU Flow uses cookies to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>Maintain your session and authentication</li>
                <li>Remember your preferences and cart items</li>
                <li>Analyze site usage and improve our services</li>
              </ul>
              <p className="mt-2">
                You can control or disable cookies through your browser settings. However, this may affect your ability to use certain features of EBU Flow.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">9. Third-Party Services</h2>
              <p>
                EBU Flow uses the following third-party services that may process your data:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>
                  <span className="font-medium">Supabase:</span> Database and authentication (<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-solar-flare hover:underline">Privacy Policy</a>)
                </li>
                <li>
                  <span className="font-medium">WhatsApp:</span> Communication (<a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-solar-flare hover:underline">Privacy Policy</a>)
                </li>
                <li>
                  <span className="font-medium">Google Maps:</span> Address services (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-solar-flare hover:underline">Privacy Policy</a>)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">10. Children&apos;s Privacy</h2>
              <p>
                EBU Flow is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you are under 18, you must have parental consent to use our services.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">11. Changes to This Policy</h2>
              <p>
                We reserve the right to update this Privacy Policy at any time. Changes will be effective immediately upon posting. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">12. Contact</h2>
              <p>
                If you have any questions, concerns, or requests regarding your privacy, please contact us:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>Email: <a href="mailto:millenianngu@gmail.com" className="text-solar-flare hover:underline">millenianngu@gmail.com</a></li>
                <li>Phone: <a href="tel:+237676648875" className="text-solar-flare hover:underline">+237 676 648 875</a></li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
