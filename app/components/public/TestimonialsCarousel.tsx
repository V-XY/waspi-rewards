 'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export type Testimonial = {
  id: string;
  name: string;
  business: string;
  quote: string;
  rating: number;
  initials: string;
};

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Hamidou Youssoufa',
    business: 'TechCorp Solutions',
    quote: 'The process was clear from the first conversation to delivery. I always knew what was happening next.',
    rating: 5,
    initials: 'HY',
  },
  {
    id: '2',
    name: 'Florence Ndongo',
    business: 'Ndongo & Associates',
    quote: 'They understood what our team needed and handled the setup without making us chase people around.',
    rating: 5,
    initials: 'FN',
  },
  {
    id: '3',
    name: 'Alain Tchoffo',
    business: 'Tchoffo Logistics',
    quote: 'I needed a solution quickly. The guided process saved me time and the delivery was straightforward.',
    rating: 4,
    initials: 'AT',
  },
  {
    id: '4',
    name: 'Rose Njang',
    business: 'Njang Enterprises',
    quote: 'Everything was explained in simple terms. I could make a decision without feeling pressured.',
    rating: 5,
    initials: 'RN',
  },
  {
    id: '5',
    name: 'Simon Awung',
    business: 'Awung Digital Agency',
    quote: 'The onboarding was easy and the team stayed available after the order instead of disappearing.',
    rating: 4,
    initials: 'SA',
  },
  {
    id: '6',
    name: 'Celine Djoumessi',
    business: 'Djoumessi & Co',
    quote: 'Trust was the biggest thing for me. The process felt transparent and the details were easy to verify.',
    rating: 5,
    initials: 'CD',
  },
];

export function TestimonialsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'next' | 'previous') => {
    trackRef.current?.scrollBy({
      left: direction === 'next' ? trackRef.current.clientWidth * 0.82 : -trackRef.current.clientWidth * 0.82,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="testimonial-track grid auto-cols-[88%] grid-flow-col gap-4 overflow-x-auto pb-4 pr-4 snap-x snap-mandatory sm:auto-cols-[calc(50%-0.5rem)] lg:auto-cols-[calc(33.333%-0.667rem)]"
        tabIndex={0}
        aria-label="Customer testimonials"
      >
        {testimonials.map((testimonial) => (
          <article key={testimonial.id} className="snap-start rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-solar-flare text-sm font-bold text-white">
                  {testimonial.initials}
                </span>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.business}</p>
                </div>
              </div>
              <div className="flex shrink-0" aria-label={`${testimonial.rating} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} className={`h-4 w-4 ${index < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'}`} />
                ))}
              </div>
            </div>
            <blockquote className="mt-6 text-[0.95rem] leading-7 text-slate-200">
              “{testimonial.quote}”
            </blockquote>
          </article>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">Swipe or use the controls to explore</p>
        <div className="flex gap-2">
          <button type="button" className="carousel-control" onClick={() => scroll('previous')} aria-label="Previous testimonials">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" className="carousel-control" onClick={() => scroll('next')} aria-label="Next testimonials">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
