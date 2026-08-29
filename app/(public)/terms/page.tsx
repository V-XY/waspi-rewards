// app/(public)/terms/page.tsx
'use client';


export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-warm-gray/10 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-midnight mb-6">Terms of Service</h1>
          <p className="text-sm text-warm-gray mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-6 text-sm text-midnight/80 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">1. Introduction</h2>
              <p>
                Welcome to EBU Flow. EBU Flow is a service provided by Millenian N. Ngangmi, an authorized MTN Business Brand Ambassador. By using EBU Flow, you agree to these Terms of Service.
              </p>
              <p className="mt-2">
                EBU Flow is a platform that facilitates the connection between customers and MTN Business products and services. We do not manufacture, sell, or guarantee the products directly - we simply connect customers with MTN&apos;s offerings.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">2. Service Description</h2>
              <p>EBU Flow provides:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>Product information and recommendations for MTN Business solutions</li>
                <li>KYC (Know Your Customer) verification services</li>
                <li>Order facilitation and delivery coordination</li>
                <li>Customer support and assistance with MTN products</li>
              </ul>
              <p className="mt-2">
                EBU Flow is NOT a mobile network operator, product manufacturer, or retailer. All products are provided by MTN Business.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">3. User Accounts</h2>
              <p>
                To place orders through EBU Flow, you may be required to create an account or provide personal information. You are responsible for:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>Providing accurate and complete information</li>
                <li>Maintaining the security of your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Being at least 18 years old or having legal guardian consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">4. KYC Requirements</h2>
              <p>
                As an authorized MTN Business Brand Ambassador, we are required to verify the identity of all customers. This includes:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>Collecting government-issued ID (National ID, Driver&apos;s License, or Passport)</li>
                <li>Taking photos of ID documents</li>
                <li>Collecting face+ID verification photos</li>
                <li>Collecting signatures to confirm identity</li>
              </ul>
              <p className="mt-2">
                Your KYC data is stored securely and used solely for verification purposes as required by MTN Business regulations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">5. Order Processing</h2>
              <p>
                When you place an order through EBU Flow:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>We will verify your identity through KYC</li>
                <li>We will process your order with MTN Business</li>
                <li>We will coordinate delivery of your product</li>
                <li>You will receive updates on your order status</li>
              </ul>
              <p className="mt-2">
                All products are subject to availability from MTN Business. We reserve the right to decline any order.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">6. Payments</h2>
              <p>
                Payment for products is made directly to MTN Business or through approved payment methods. EBU Flow does not store payment information.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>Payment confirmation is required before order processing</li>
                <li>Prices are subject to change without prior notice</li>
                <li>All payments are in CFA francs (FCFA)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">7. Delivery</h2>
              <p>
                Delivery is coordinated by EBU Flow on behalf of MTN Business. We will contact you to arrange delivery after your order is confirmed.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>Delivery timelines are estimates and may vary</li>
                <li>We are not responsible for delays caused by circumstances beyond our control</li>
                <li>You must be available to receive your delivery</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">8. Returns & Refunds</h2>
              <p className="font-medium text-midnight">Important Notice:</p>
              <p>
                EBU Flow does not sell products directly. We are a facilitation service connecting customers with MTN Business. All products are provided by MTN Business and are subject to their policies.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>
                  <span className="font-medium">Hardware:</span> All hardware products (HomeBox, WiFIX, etc.) are provided by MTN Business. Any hardware issues must be reported directly to MTN Business. EBU Flow will assist you in contacting MTN support.
                </li>
                <li>
                  <span className="font-medium">Digital Services:</span> Services such as SMART SMS, Domain Registrations, and SIM activations are non-refundable once processed.
                </li>
                <li>
                  <span className="font-medium">Product Condition:</span> All products are inspected before delivery. If you receive a defective product, you must contact EBU Flow within 24 hours of delivery to report the issue.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">9. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, EBU Flow and Millenian N. Ngangmi shall not be liable for:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>Any indirect, incidental, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Product defects or failures (these are covered by MTN Business warranties)</li>
                <li>Service interruptions or delays beyond our control</li>
              </ul>
              <p className="mt-2">
                Our total liability shall not exceed the total amount paid by you for the specific order in question.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">10. Disclaimer</h2>
              <p>
                EBU Flow is provided &ldquo;as is&rdquo; without any warranties, express or implied. We do not guarantee that:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>The service will be uninterrupted or error-free</li>
                <li>Product availability at all times</li>
                <li>Delivery timelines will always be met</li>
              </ul>
              <p className="mt-2">
                All products are subject to MTN Business terms, availability, and pricing.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">11. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless EBU Flow, Millenian N. Ngangmi, and any affiliates from any claims, damages, or expenses arising from:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>Your use of the service</li>
                <li>Your violation of these terms</li>
                <li>Your violation of any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">12. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your access to EBU Flow at any time, without notice, for any reason including:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>Violation of these Terms of Service</li>
                <li>Fraudulent or illegal activity</li>
                <li>Non-compliance with KYC requirements</li>
                <li>At our sole discretion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">13. Governing Law</h2>
              <p>
                These Terms of Service shall be governed by and construed in accordance with the laws of Cameroon. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Cameroon.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">14. Dispute Resolution</h2>
              <p>
                Any disputes arising from your use of EBU Flow shall first be attempted to be resolved through informal negotiation. If resolution cannot be reached, the dispute shall be submitted to mediation or arbitration in Cameroon before proceeding to litigation.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">15. Changes to These Terms</h2>
              <p>
                We reserve the right to update these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of EBU Flow constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">16. Intellectual Property</h2>
              <p>
                All content, design, code, and intellectual property contained in EBU Flow 
                (including but not limited to text, graphics, logos, icons, images, audio clips, 
                digital downloads, data compilations, and software) is the exclusive property 
                of Millenian N. Ngangmi and VIRXEE and is protected by copyright laws and 
                international treaty provisions.
              </p>
              <p className="mt-2">
                Unauthorized use, reproduction, distribution, modification, or reverse engineering 
                of any part of EBU Flow is strictly prohibited. You may not:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-midnight/80">
                <li>Copy, reproduce, or distribute any content without prior written consent</li>
                <li>Reverse engineer, decompile, or disassemble any part of the platform</li>
                <li>Create derivative works based on EBU Flow</li>
                <li>Remove or alter any proprietary notices or labels</li>
              </ul>
              <p className="mt-2">
                Any unauthorized copying, reproduction, or distribution of the software or its 
                source code will be pursued to the fullest extent of the law, including but not 
                limited to civil remedies and criminal prosecution under applicable copyright and 
                intellectual property laws.
              </p>
              <p className="mt-2">
                The name &quot;EBU Flow&quot; and the EBU Flow logo are trademarks of Millenian N. Ngangmi
                and may not be used without prior written permission.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-midnight mb-3">17. Contact</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us:
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
