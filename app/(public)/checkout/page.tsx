// app/(public)/checkout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/app/context/CartContext';
import { ArrowLeft, ShoppingBag, CreditCard, User, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'payment' | 'complete'>('details');
  const [orderNumber, setOrderNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    landmark: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && step !== 'complete') {
      router.push('/products');
    }
  }, [items, router, step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.address.trim()) newErrors.address = 'Delivery address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email || undefined,
            address: formData.address,
            landmark: formData.landmark || undefined,
          },
          items: items.map(item => ({ productId: item.product_id, quantity: item.quantity })),
          source: 'website',
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create order');
      setOrderNumber(result.order.order_number);
      setTrackingUrl(result.tracking_url || '');
      clearCart();
      toast.success('Order created. Complete your KYC to continue.');
      router.push(result.kyc_url);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="w-20 h-20 bg-ghost-green rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-midnight mb-2">
              Order Confirmed!
            </h1>
            <p className="text-warm-gray mb-4">
              Thank you for your order. We&apos;ll contact you shortly.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-warm-gray">Order Number</p>
              <p className="text-lg font-bold text-midnight">{orderNumber}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={trackingUrl || '/products'}
                className="px-6 py-3 bg-solar-flare text-white font-medium rounded-lg hover:bg-solar-flare/90 transition-colors"
              >
                Track Order
              </Link>
              <Link
                href="/products"
                className="px-6 py-3 bg-white border border-warm-gray/30 text-midnight font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-midnight" />
          </Link>
          <h1 className="text-2xl font-bold text-midnight">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Details */}
            <div className="bg-white rounded-xl shadow-sm border border-warm-gray/10 p-6">
              <h2 className="font-semibold text-midnight mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-solar-flare" />
                Delivery Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-midnight mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-solar-flare focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-warm-gray/30'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-midnight mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-solar-flare focus:border-transparent ${
                        errors.phone ? 'border-red-500' : 'border-warm-gray/30'
                      }`}
                      placeholder="6XX XXX XXX"
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-midnight mb-1">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-solar-flare focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-warm-gray/30'
                      }`}
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight mb-1">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-solar-flare focus:border-transparent ${
                      errors.address ? 'border-red-500' : 'border-warm-gray/30'
                    }`}
                    placeholder="Street, Quarter, City"
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-midnight mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-warm-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-solar-flare focus:border-transparent"
                    placeholder="Near Total, opposite Market..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border border-warm-gray/10 p-6">
              <h2 className="font-semibold text-midnight mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-solar-flare" />
                Payment Method
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 border border-warm-gray/30 rounded-lg bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="mobile_money"
                    defaultChecked
                    className="w-4 h-4 text-solar-flare"
                  />
                  <div>
                    <p className="font-medium text-midnight">Mobile Money</p>
                    <p className="text-sm text-warm-gray">Pay with Orange Money or MTN Mobile Money</p>
                  </div>
                </div>
                <p className="text-xs text-warm-gray italic">
                  Payment becomes available after your KYC is approved. No payment is taken at this stage.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-warm-gray/10 p-6 sticky top-24">
              <h2 className="font-semibold text-midnight mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-solar-flare" />
                Order Summary
              </h2>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product_id} className="flex justify-between text-sm">
                    <span className="text-midnight">{item.name} × {item.quantity}</span>
                    <span className="text-midnight font-medium">{item.total.toLocaleString()} FCFA</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-warm-gray/10 pt-4 mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">Subtotal</span>
                  <span className="text-midnight">{total.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-warm-gray">Delivery</span>
                  <span className="text-ghost-green">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-warm-gray/10">
                  <span className="text-midnight">Total</span>
                  <span className="text-solar-flare">{total.toLocaleString()} FCFA</span>
                </div>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={loading || items.length === 0}
                className="w-full mt-6 px-6 py-3 bg-solar-flare text-white font-semibold rounded-lg hover:bg-solar-flare/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>

              <p className="text-xs text-warm-gray text-center mt-3">
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
