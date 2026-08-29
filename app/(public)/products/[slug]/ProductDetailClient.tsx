// app/(public)/products/[slug]/ProductDetailClient.tsx
'use client';

import { useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import { Product } from '@/app/lib/types';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Check, 
  Clock, 
  Shield, 
  Users, 
  Truck,
  Wifi,
  Phone,
  Database,
  Mail,
  Lock,
  BadgeCheck,
  Smartphone,
  Store,
  Building2,
  GraduationCap,
  HeartPulse,
  Home,
  MessageCircle,
  CreditCard
} from 'lucide-react';

interface ProductDetailClientProps {
  product: Product;
}

const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  connectivity: Wifi,
  voice: Phone,
  data: Database,
  marketing: Mail,
  security: Lock,
  identity: BadgeCheck,
};

const industryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  retail: Store,
  logistics: Truck,
  education: GraduationCap,
  healthcare: HeartPulse,
  enterprise: Building2,
  home: Home,
};

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      total: product.price * quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      connectivity: 'Connectivity',
      voice: 'Voice Solutions',
      data: 'Data Packs',
      marketing: 'Marketing Tools',
      security: 'Security Solutions',
      identity: 'Identity & Branding',
    };
    return map[category] || category;
  };

  const getCategoryIcon = (category: string) => {
    const Icon = featureIcons[category] || Smartphone;
    return <Icon className="w-6 h-6" />;
  };

  const getBillingLabel = (cycle: string) => {
    return cycle === 'monthly' ? 'per month' : 'one-time payment';
  };

  const getFeaturesList = (product: Product) => {
    const features: Array<{ label: string; value: string }> = [];

    if (product.features?.calls) {
      features.push({ label: 'Call Bonus', value: String(product.features.calls) });
    }
    if (product.features?.data) {
      features.push({ label: 'Data', value: String(product.features.data) });
    }
    if (product.features?.speed) {
      features.push({ label: 'Speed', value: String(product.features.speed) });
    }
    if (product.features?.bandwidth) {
      features.push({ label: 'Bandwidth', value: String(product.features.bandwidth) });
    }
    if (product.features?.validity) {
      features.push({ label: 'Validity', value: String(product.features.validity) });
    }
    if (product.features?.includes) {
      features.push({
        label: 'Includes',
        value: Array.isArray(product.features.includes)
          ? product.features.includes.join(', ')
          : String(product.features.includes),
      });
    }
    if (product.features?.addons) {
      features.push({
        label: 'Add-ons',
        value: Array.isArray(product.features.addons)
          ? product.features.addons.join(', ')
          : String(product.features.addons),
      });
    }

    return features;
  };

  const getProductCopy = (product: Product) => {
    const name = product.name.toLowerCase();
    
    if (name.includes('homebox')) {
      return {
        paragraph: 'If you are tired of buying data bundles that finish before lunch, or activating bundles two or three times a day because your work needs the internet, this plan is for you. It is a fixed connection that is literally unlimited. In addition, you get the device and a SIM card at no extra cost, and you pay for the bundle once a month; choosing to renew the plan that fits your budget. No surprises, and no running out of data.',
        bullet1: 'Reliable internet for your home or office that does not run out of data.',
        bullet2: 'You get the device and SIM card for FREE, and the first month is included.',
        bullet3: 'Perfect for remote work, streaming, and daily browsing.',
        audience: 'Small businesses, home offices, freelancers, and families.'
      };
    }
    
    if (name.includes('wifix')) {
      return {
        paragraph: 'A reception desk is the first thing your customers see. If your phone system looks outdated or your internet keeps dropping, you look like you do not take your business seriously. WiFIX changes that. It is a desktop phone and a 4G router combined into one device, with unlimited internet and Kaspersky antivirus included. You set it up once and it works. Your reception desk looks professional, your calls stay connected, and you do not have to think about it again.',
        bullet1: 'Desktop phone and 4G router combined into one device.',
        bullet2: 'Unlimited internet and Kaspersky antivirus included.',
        bullet3: 'Simple setup, professional look, reliable connection.',
        audience: 'Offices, shops, hotels, and businesses with a reception desk.'
      };
    }
    
    if (name.includes('sme') && name.includes('3k')) {
      return {
        paragraph: 'Most business plans make you pay for things you do not use. SME in the Box works differently. You get 3,000 FCFA worth of calls and 2GB of data, and you also get to choose one free add-on, which can be WhatsApp Business, Kaspersky, PRO SMS, Ring Pro, or OneOffice Lite. You pay for what you need each month, and nothing more. It is prepaid, so there are no surprises.',
        bullet1: '3,000 FCFA in calls and 2GB of data included.',
        bullet2: 'Choose one free business add-on every month.',
        bullet3: 'Prepaid plan with no surprises or hidden charges.',
        audience: 'Small businesses, startups, and freelancers.'
      };
    }
    
    if (name.includes('sme') && name.includes('5k')) {
      return {
        paragraph: 'Most business plans make you pay for things you do not use. SME in the Box works differently. You get 5,000 FCFA worth of calls and 3.5GB of data, and you also get to choose one free add-on, which can be WhatsApp Business, Kaspersky, PRO SMS, Ring Pro, or OneOffice Lite. You pay for what you need each month, and nothing more. It is prepaid, so there are no surprises.',
        bullet1: '5,000 FCFA in calls and 3.5GB of data included.',
        bullet2: 'Choose one free business add-on every month.',
        bullet3: 'Prepaid plan with no surprises or hidden charges.',
        audience: 'Small businesses, startups, and freelancers.'
      };
    }
    
    if (name.includes('flotte') || name.includes('fleet')) {
      return {
        paragraph: 'Your team should talk freely without worrying about credit. Flotte Téléphonique gives you unlimited calls between your team members. You pay per line, and that is it. No per-minute charges, no surprises, just calls that work. It is the simplest way to keep your team connected.',
        bullet1: 'Unlimited internal calls for your team.',
        bullet2: 'Flat rate per line with no hidden fees.',
        bullet3: 'Simple setup and no per-minute charges.',
        audience: 'Teams, offices, and organizations with multiple employees.'
      };
    }
    
    if (name.includes('wispeed')) {
      const price = product.price;
      const tier = price === 15000 ? '15K' : price === 25000 ? '25K' : price === 40000 ? '40K' : '60K';
      return {
        paragraph: `You buy data, and it disappears faster than you expect. WISPEED is a high-volume data pack that lasts. It gives you the data you need without the sticker shock, and it stays active for 30 days. If your phone is your office, this is the data pack for you.`,
        bullet1: `${tier} data pack for heavy usage.`,
        bullet2: 'Valid for 30 days with no hidden limits.',
        bullet3: 'Perfect for remote work, streaming, and heavy browsing.',
        audience: 'Remote workers, internet cafes, and heavy data users.'
      };
    }
    
    if (name.includes('tera')) {
      if (name.includes('start')) {
        return {
          paragraph: 'Your business moves fast. If your internet does not keep up, it slows you down. Tera-Link gives you fiber internet with speeds up to 450 Mbps. The equipment cost is reduced by 70 percent, so you get enterprise-level speed without the enterprise-level price. It is for businesses that cannot afford slow internet.',
          bullet1: 'Fiber internet with speeds up to 450 Mbps.',
          bullet2: 'Equipment cost reduced by 70 percent.',
          bullet3: 'Setup included with one-time payment.',
          audience: 'Enterprises, logistics companies, and healthcare facilities.'
        };
      }
      return {
        paragraph: 'Your business moves fast. If your internet does not keep up, it slows you down. Tera-Link gives you fiber internet with speeds up to 450 Mbps. You pay a flat monthly fee and you get the speed you need. It is for businesses that cannot afford slow internet.',
        bullet1: 'Fiber internet with speeds up to 450 Mbps.',
        bullet2: 'Flat monthly fee with no surprises.',
        bullet3: 'No long-term contract required.',
        audience: 'Enterprises, logistics companies, and healthcare facilities.'
      };
    }
    
    if (name.includes('kaspersky')) {
      return {
        paragraph: 'You store your life on your phone. One wrong download and everything is gone. Kaspersky Mobile Security protects your phone without slowing it down. It works quietly in the background, and you do not even notice it until you need it. It is one less thing to worry about.',
        bullet1: '1-year license for mobile antivirus protection.',
        bullet2: 'Protects one device with automatic updates.',
        bullet3: 'Works quietly in the background without slowing your phone.',
        audience: 'Anyone who uses their phone for work and personal life.'
      };
    }
    
    if (name.includes('domain')) {
      if (name.includes('.cm') || name.includes('cm')) {
        return {
          paragraph: 'Your business needs a website, and your website needs an address. A .cm domain is your corner of the internet. It costs 7,000 FCFA for one year, and it makes your business look professional. It is simple to set up and easy to renew.',
          bullet1: '1-year registration for a .cm domain.',
          bullet2: 'Professional online presence for your business.',
          bullet3: 'Simple setup and easy renewal process.',
          audience: 'Businesses that want a professional online presence.'
        };
      }
      return {
        paragraph: 'Your business needs a website, and your website needs an address. A .com, .org, or .net domain is your corner of the internet. It costs 9,900 FCFA for one year, and it makes your business look professional. It is simple to set up and easy to renew.',
        bullet1: '1-year registration for a .com, .org, or .net domain.',
        bullet2: 'Professional online presence for your business.',
        bullet3: 'Simple setup and easy renewal process.',
        audience: 'Businesses that want a professional online presence.'
      };
    }
    
    if (name.includes('smart card')) {
      if (name.includes('basic')) {
        return {
          paragraph: 'Paper business cards get lost, thrown away, or forgotten. A Smart Card is a digital business card that lives on your phone. You share it with a tap, you update it instantly, and you never run out. It costs 9,900 FCFA and it works for one year. It is the simplest way to make sure people remember you.',
          bullet1: 'Digital business card for one year.',
          bullet2: 'Share with a tap and update instantly.',
          bullet3: 'Never run out of business cards again.',
          audience: 'Professionals who want to be remembered.'
        };
      }
      if (name.includes('premium')) {
        return {
          paragraph: 'Paper business cards get lost, thrown away, or forgotten. A Smart Card is a digital business card that lives on your phone. You share it with a tap, you update it instantly, and you never run out. It costs 24,900 FCFA and includes advanced features and premium design. It is the simplest way to make sure people remember you.',
          bullet1: 'Digital business card for one year.',
          bullet2: 'Advanced features and premium design included.',
          bullet3: 'Share with a tap and update instantly.',
          audience: 'Professionals who want to be remembered.'
        };
      }
      if (name.includes('enterprise')) {
        return {
          paragraph: 'Paper business cards get lost, thrown away, or forgotten. A Smart Card is a digital business card that lives on your phone. You share it with a tap, you update it instantly, and you never run out. It costs 39,900 FCFA and includes full customization and enterprise features. It is the simplest way to make sure people remember you.',
          bullet1: 'Digital business card for one year.',
          bullet2: 'Full customization and enterprise features.',
          bullet3: 'Share with a tap and update instantly.',
          audience: 'Enterprises and professionals who want to be remembered.'
        };
      }
    }
    
    if (name.includes('ringpro')) {
      return {
        paragraph: 'When customers call you, they hear the same ringing tone as everyone else. RingPro replaces that with a custom business advertisement tune. It costs 5,000 FCFA and lasts for 30 days. It is a small detail that makes you look professional.',
        bullet1: 'Custom business ringback tone for 30 days.',
        bullet2: 'Makes your business phone sound professional.',
        bullet3: 'Small detail that leaves a lasting impression.',
        audience: 'Businesses that want to make a good impression.'
      };
    }
    
    // Fallback
    return {
      paragraph: product.description || 'Learn more about this product and how it can help your business.',
      bullet1: 'Reliable solution for your business needs.',
      bullet2: 'Simple setup and easy to use.',
      bullet3: 'Backed by MTN Business.',
      audience: 'Businesses of all sizes.'
    };
  };

  const copy = getProductCopy(product);
  const features = getFeaturesList(product);
  const Icon = featureIcons[product.category] || Smartphone;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <nav className="flex items-center gap-2 text-sm text-warm-gray mb-6">
        <Link href="/" className="hover:text-midnight transition-colors">Home</Link>
        <span>›</span>
        <Link href="/products" className="hover:text-midnight transition-colors">Products</Link>
        <span>›</span>
        <span className="text-midnight font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-gradient-blue-frost/30 dark:bg-midnight/50 rounded-2xl overflow-hidden aspect-square flex items-center justify-center relative">
          <span className="text-8xl opacity-30">
            {product.category === 'connectivity' && '📶'}
            {product.category === 'voice' && '📞'}
            {product.category === 'data' && '📊'}
            {product.category === 'marketing' && '📱'}
            {product.category === 'security' && '🔒'}
            {product.category === 'identity' && '🪪'}
          </span>
          <span className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-midnight shadow-sm">
            {getCategoryIcon(product.category)}
            {getCategoryLabel(product.category)}
          </span>
          <span className="absolute top-4 right-4 px-3 py-1.5 bg-solar-flare text-white rounded-lg text-xs font-medium shadow-sm">
            {product.billing_cycle === 'monthly' ? 'Monthly' : 'One-Time'}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-midnight dark:text-white">
              {product.name}
            </h1>
            <p className="text-warm-gray dark:text-warm-gray/60 mt-2">
              {product.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-solar-flare">
              {product.price.toLocaleString()} FCFA
            </span>
            <span className="text-sm text-warm-gray">
              {getBillingLabel(product.billing_cycle)}
            </span>
          </div>

          <div className="bg-gray-50 dark:bg-ebony/50 rounded-xl p-6 space-y-4">
            <p className="text-sm text-midnight dark:text-white leading-relaxed">
              {copy.paragraph}
            </p>
          </div>

          <div className="bg-white dark:bg-ebony rounded-xl border border-warm-gray/10 dark:border-white/5 p-6 space-y-4">
            <h3 className="font-semibold text-midnight dark:text-white text-sm">
              Why choose {product.name}?
            </h3>
            <ul className="space-y-2 text-sm text-midnight dark:text-white">
              <li className="flex items-start gap-2">
                <span className="text-solar-flare mt-0.5">•</span>
                <span>{copy.bullet1}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-solar-flare mt-0.5">•</span>
                <span>{copy.bullet2}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-solar-flare mt-0.5">•</span>
                <span>{copy.bullet3}</span>
              </li>
            </ul>

            <div className="pt-4 border-t border-warm-gray/10 dark:border-white/5">
              <h4 className="text-xs font-semibold text-warm-gray uppercase tracking-wider mb-2">
                Who is this for?
              </h4>
              <p className="text-sm text-midnight dark:text-white">
                {copy.audience}
              </p>
            </div>
          </div>

          {features.length > 0 && (
            <div className="bg-gray-50 dark:bg-ebony/50 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-semibold text-midnight dark:text-white mb-2">
                Key Features
              </h3>
              {features.map((feature, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-warm-gray">{feature.label}</span>
                  <span className="text-midnight dark:text-white font-medium text-right max-w-[60%]">
                    {feature.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="flex items-center border border-warm-gray/30 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-midnight dark:text-white font-medium"
              >
                -
              </button>
              <span className="px-4 py-3 text-midnight dark:text-white font-medium min-w-[48px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-midnight dark:text-white font-medium"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className={`
                flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all
                ${added
                  ? 'bg-ghost-green text-emerald-700 dark:bg-ghost-green/30'
                  : 'bg-solar-flare text-white hover:bg-solar-flare/90 shadow-lg hover:shadow-xl'
                }
              `}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-warm-gray/10 dark:border-white/5">
            <div className="flex items-center gap-2 text-xs text-warm-gray">
              <Truck className="w-4 h-4 text-ultramarine" />
              <span>Free delivery</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-warm-gray">
              <Shield className="w-4 h-4 text-ultramarine" />
              <span>Secure checkout</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-warm-gray">
              <Users className="w-4 h-4 text-ultramarine" />
              <span>Trusted by 500+</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-warm-gray">
              <MessageCircle className="w-4 h-4 text-ultramarine" />
              <span>Support included</span>
            </div>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm text-warm-gray hover:text-midnight dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse all products
          </Link>
        </div>
      </div>
    </div>
  );
}