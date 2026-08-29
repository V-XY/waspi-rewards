// app/components/shared/LiveChatButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface LiveChatButtonProps {
  phoneNumber: string;
  message?: string;
}

export function LiveChatButton({
  phoneNumber,
  message = "Hello! I need help with EBU Flow.",
}: LiveChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChat = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
      }`}
    >
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-warm-gray/10 overflow-hidden mb-2">
          <div className="bg-gradient-sunrise px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Chat with Us</p>
              <p className="text-white/80 text-xs">Typically replies in 5 minutes</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-midnight">
              👋 Hi there! Need help with EBU Flow? We&apos;re here to assist you.
            </p>
            <button
              onClick={handleChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-solar-flare text-white font-medium rounded-lg hover:bg-solar-flare/90 transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Start WhatsApp Chat
            </button>
            <p className="text-xs text-warm-gray text-center">
              Available 9 AM - 6 PM, Monday - Friday
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-warm-gray hover:text-midnight transition-colors w-full text-center"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-sunrise text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center relative group"
        aria-label="Live Chat"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-ghost-green rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-ghost-green rounded-full"></span>
          </>
        )}
      </button>
    </div>
  );
}
