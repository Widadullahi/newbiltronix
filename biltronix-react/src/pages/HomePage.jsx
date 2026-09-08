import React, { useState, useEffect } from 'react';
import SiteHeader from '../components/layout/SiteHeader.jsx';
import FloatingWhatsApp from '../components/static/FloatingWhatsApp.jsx';
import { Link } from 'react-router-dom';

const quickStats = [
  { value: '120+', label: 'Ready Vehicles', detail: 'Checked before listing' },
  { value: '360+', label: 'Advisory Guides', detail: 'Practical ownership notes' },
  { value: '15', label: 'Trusted Brands', detail: 'Selected for reliability' },
  { value: '24/7', label: 'Buyer Support', detail: 'Guidance when you need it' },
];

const featureBoxes = [
  {
    title: 'Clear Sourcing',
    copy: 'Listings are presented with the details buyers need before committing.',
    icon: 'fas fa-search',
  },
  {
    title: 'Stock Guidance',
    copy: 'Get directed to vehicles, parts, and accessories that fit your brief.',
    icon: 'fas fa-bell',
  },
  {
    title: 'Technical Advice',
    copy: 'Maintenance and inspection guidance written for real ownership decisions.',
    icon: 'fas fa-cogs',
  },
];

const serviceItems = [
  {
    icon: 'fas fa-car',
    title: 'Vehicle Sales',
    description: 'Premium used and foreign vehicles, thoroughly inspected and certified for quality. From sedans to SUVs, find your perfect ride.',
    link: '/sales',
    linkText: 'Browse Vehicles',
    image: '/hero-car-original-withbackground.jpeg',
  },
  {
    icon: 'fas fa-cogs',
    title: 'Genuine Parts',
    description: 'OEM-quality replacement parts, filters, brakes, batteries, and service kits for all major vehicle makes and models.',
    link: '/sales',
    linkText: 'Shop Parts',
    image: '/repair-troubleshooting.jpeg',
  },
  {
    icon: 'fas fa-clipboard-check',
    title: 'Pre-Purchase Inspection',
    description: 'Professional 150+ point vehicle inspection service. Get detailed reports with photos before you buy any used car.',
    link: '/inspection-app',
    linkText: 'Book Inspection',
    image: '/prepurchase-inspection.jpg',
  },
  {
    icon: 'fas fa-wrench',
    title: 'Service & Maintenance',
    description: 'Scheduled maintenance, oil changes, and repairs by certified technicians. Keep your vehicle running at peak performance.',
    link: '#',
    linkText: 'Schedule Service',
    image: '/repair-troubleshooting.jpeg',
  },
  {
    icon: 'fas fa-headset',
    title: 'Expert Consultation',
    description: 'Get personalized advice from our automotive experts. We help you make informed decisions on purchases and maintenance.',
    link: 'https://wa.me/2347060882711',
    linkText: 'Consult Now',
    image: '/computerized Diagnostics.jpg',
  },
  {
    icon: 'fas fa-truck',
    title: 'Delivery Service',
    description: 'Safe and insured vehicle delivery across Nigeria. We bring your purchase directly to your doorstep.',
    link: '#',
    linkText: 'Learn More',
    image: '/hero-car-original-withbackground.jpeg',
  },
];

const highlightCards = [
  {
    title: 'Vehicles',
    emphasis: 'Certified Quality',
    desc: 'Premium sedans, SUVs, and trucks selected for confident ownership.',
    image: '/hero-car-original-withbackground.jpeg',
  },
  {
    title: 'Parts',
    desc: 'OEM-grade replacements, filters, brakes, batteries, and service kits.',
    emphasis: 'Genuine Parts',
    image: '/repair-troubleshooting.jpeg',
  },
  {
    title: 'Accessories',
    desc: 'Dash cams, seat covers, audio systems, and premium travel gear.',
    emphasis: 'Premium Selection',
    image: '/computerized Diagnostics.jpg',
  },
];

const HERO_LINES = [
  { top: '7%',  width: '220px', delay: '0.00s', dur: '1.05s', opacity: 0.9 },
  { top: '13%', width: '110px', delay: '0.22s', dur: '0.80s', opacity: 0.6 },
  { top: '20%', width: '300px', delay: '0.08s', dur: '1.15s', opacity: 0.85 },
  { top: '27%', width: '85px',  delay: '0.38s', dur: '0.72s', opacity: 0.5 },
  { top: '34%', width: '360px', delay: '0.14s', dur: '1.25s', opacity: 0.9 },
  { top: '41%', width: '150px', delay: '0.42s', dur: '0.92s', opacity: 0.65 },
  { top: '49%', width: '260px', delay: '0.06s', dur: '1.08s', opacity: 0.8 },
  { top: '57%', width: '100px', delay: '0.30s', dur: '0.78s', opacity: 0.5 },
  { top: '65%', width: '320px', delay: '0.18s', dur: '1.18s', opacity: 0.75 },
  { top: '73%', width: '75px',  delay: '0.48s', dur: '0.88s', opacity: 0.4 },
  { top: '80%', width: '180px', delay: '0.10s', dur: '1.00s', opacity: 0.7 },
];

const typeBadgeClasses = {
  vehicle: 'bg-gradient-to-br from-blue-700/95 to-blue-400/80 text-white',
  part: 'bg-green-600/85 text-white',
  accessory: 'bg-violet-600/85 text-white',
};

const itemTagClasses = {
  vehicle: 'bg-blue-600/20 text-blue-200',
  part: 'bg-green-600/20 text-green-300',
  accessory: 'bg-violet-600/20 text-violet-200',
};

const heroServices = [
  { icon: 'fas fa-car', label: 'Vehicle Sales' },
  { icon: 'fas fa-cogs', label: 'Genuine Parts' },
  { icon: 'fas fa-clipboard-check', label: 'Pre-Purchase Inspection' },
  { icon: 'fas fa-wrench', label: 'Service & Maintenance' },
];

// Featured items for hero carousel - includes vehicles, parts, and accessories
const featuredItems = [
  {
    type: 'vehicle',
    name: 'Lexus RX 350',
    price: 'NGN 28,500,000',
    image: '/hero-car-original-withbackground.jpeg',
    badge: 'Vehicle',
  },
  {
    type: 'vehicle',
    name: 'Mercedes-Benz GLE',
    price: 'NGN 45,000,000',
    image: '/hero-car-original-withbackground.jpeg',
    badge: 'Vehicle',
  },
  {
    type: 'vehicle',
    name: 'Toyota Land Cruiser',
    price: 'NGN 52,000,000',
    image: '/hero-car-original-withbackground.jpeg',
    badge: 'Vehicle',
  },
  {
    type: 'part',
    name: 'OEM Brake Pad Set',
    price: 'NGN 62,000',
    image: '/repair-troubleshooting.jpeg',
    badge: 'Parts',
  },
  {
    type: 'part',
    name: 'Synthetic Motor Oil',
    price: 'NGN 28,500',
    image: '/computerized Diagnostics.jpg',
    badge: 'Parts',
  },
  {
    type: 'accessory',
    name: '4K Dash Camera',
    price: 'NGN 85,000',
    image: '/ecu-trouble-shooting-repair.jpeg',
    badge: 'Accessories',
  },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroAnimated, setHeroAnimated] = useState(false);

  // Trigger hero animation shortly after mount
  useEffect(() => {
    const t = setTimeout(() => setHeroAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  // Auto-advance carousel every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredItems.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredItems.length);
  };

  return (
    <div className="min-h-screen bg-glass-bg">
      <SiteHeader />

      {/* ── Showroom Hero ── */}
      <section
        className={`relative flex min-h-[calc(100vh-96px)] w-full items-center overflow-hidden xl:min-h-[90vh] max-[900px]:min-h-0 max-[900px]:flex-col max-[900px]:justify-start max-[900px]:pt-9${heroAnimated ? ' lux-on' : ''}`}
        aria-label="Biltronix hero"
      >
        {/* Background showroom image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/new_design/background.png"
            alt=""
            className="h-full w-full object-cover object-center"
            aria-hidden="true"
          />
        </div>

        {/* Left hero content */}
        <div className="relative z-20 w-full flex-[0_0_48%] pl-[7%] pr-4 max-[1100px]:flex-[0_0_52%] max-[900px]:mx-auto max-[900px]:max-w-3xl max-[900px]:flex-none max-[900px]:px-6 max-[900px]:text-center max-[640px]:px-[18px]">
          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#0f1b2d] px-4 py-2 max-[900px]:mx-auto">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c9952c] text-[0.6rem] text-white">
              <i className="fas fa-star" aria-hidden="true"></i>
            </span>
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white">Premium Automobile Solutions</span>
          </div>

          <h1 className="m-0 mb-5 max-w-[680px] font-heading text-[clamp(2.5rem,5vw,4.2rem)] font-extrabold leading-[1.08] text-[#0f1b2d] max-[900px]:mx-auto max-[640px]:text-[clamp(2rem,10vw,2.75rem)]">
            Find Your Dream Car at{' '}
            <span className="text-[#c9952c]">Biltronix</span>
          </h1>

          <p className="mb-5 max-w-[470px] text-base leading-[1.78] text-slate-600 max-[900px]:mx-auto max-[900px]:max-w-[620px] max-[640px]:mb-[18px] max-[640px]:text-[0.95rem] max-[640px]:leading-7">
            Browse our curated selection of premium vehicles, genuine parts, and
            expert guidance. Every vehicle is thoroughly inspected and backed by
            our quality guarantee.
          </p>

          {/* Service pills */}
          <div className="mb-7 flex flex-wrap gap-2.5 max-w-[580px] max-[900px]:mx-auto max-[640px]:mb-5 max-[640px]:justify-center">
            {heroServices.map((service) => (
              <span key={service.label} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-[0.75rem] font-semibold text-[#0f1b2d] shadow-sm backdrop-blur-sm max-[420px]:text-[0.68rem]">
                <i className={`${service.icon} w-4 text-center text-[#0f1b2d]`} aria-hidden="true"></i>
                {service.label}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="mb-8 flex flex-wrap items-center gap-3.5 max-[900px]:mb-6 max-[900px]:justify-center max-[640px]:mb-[18px] max-[640px]:grid max-[640px]:grid-cols-1 max-[640px]:gap-2.5">
            <Link to="/sales" className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#0f1b2d] px-7 py-3.5 text-[0.82rem] font-bold text-white no-underline shadow-lg transition hover:-translate-y-0.5 hover:bg-[#162640] hover:text-white max-[640px]:w-full">
              Browse Inventory
              <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </Link>
            <Link to="/car-tips" className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#0f1b2d] px-7 py-3.5 text-[0.82rem] font-bold text-[#0f1b2d] no-underline transition hover:bg-[#0f1b2d] hover:text-white max-[640px]:w-full">
              Expert Tips
              <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-5 max-[900px]:mb-0 max-[900px]:grid max-[900px]:grid-cols-3 max-[900px]:gap-2.5">
            <span className="flex items-center gap-2 text-[0.8rem] text-[#0f1b2d]/80 max-[900px]:justify-center max-[900px]:rounded-lg max-[900px]:border max-[900px]:border-slate-200 max-[900px]:bg-white/60 max-[900px]:px-3 max-[900px]:py-2.5 max-[900px]:text-[0.72rem] max-[900px]:text-[#0f1b2d] [&_i]:text-[0.9rem] [&_i]:text-[#c9952c]">
                <i className="fas fa-shield-alt" aria-hidden="true"></i>
                <span><strong>Certified</strong> <span className="text-[0.7rem] text-slate-500">Quality Assured</span></span>
              </span>
            <span className="flex items-center gap-2 text-[0.8rem] text-[#0f1b2d]/80 max-[900px]:justify-center max-[900px]:rounded-lg max-[900px]:border max-[900px]:border-slate-200 max-[900px]:bg-white/60 max-[900px]:px-3 max-[900px]:py-2.5 max-[900px]:text-[0.72rem] max-[900px]:text-[#0f1b2d] [&_i]:text-[0.9rem] [&_i]:text-[#c9952c]">
                <i className="fas fa-truck" aria-hidden="true"></i>
                <span><strong>Fast Delivery</strong> <span className="text-[0.7rem] text-slate-500">Across Nigeria</span></span>
              </span>
            <span className="flex items-center gap-2 text-[0.8rem] text-[#0f1b2d]/80 max-[900px]:justify-center max-[900px]:rounded-lg max-[900px]:border max-[900px]:border-slate-200 max-[900px]:bg-white/60 max-[900px]:px-3 max-[900px]:py-2.5 max-[900px]:text-[0.72rem] max-[900px]:text-[#0f1b2d] [&_i]:text-[0.9rem] [&_i]:text-[#c9952c]">
                <i className="fas fa-headset" aria-hidden="true"></i>
                <span><strong>24/7 Support</strong> <span className="text-[0.7rem] text-slate-500">We're here to help</span></span>
              </span>
          </div>
        </div>

        {/* Car + floating cards */}
        <div className="absolute right-0 top-0 z-[5] flex h-full w-[55%] items-center justify-center max-[1100px]:w-[50%] max-[900px]:relative max-[900px]:right-auto max-[900px]:top-auto max-[900px]:mt-1 max-[900px]:h-[260px] max-[900px]:w-full max-[640px]:mt-0 max-[640px]:h-[180px] max-[420px]:h-[160px]" aria-hidden="true">
          {/* Car image */}
          <div className="absolute inset-0 flex items-end justify-center max-[900px]:items-center">
            <img
              src="/new_design/car.png"
              alt="Premium vehicle — Biltronix collection"
              className="h-[85%] w-auto object-contain max-[900px]:h-[90%] max-[900px]:px-4 max-[640px]:px-2"
              loading="eager"
            />
          </div>

          {/* Floating card: Rating */}
          <div className="absolute right-[8%] top-[18%] z-[10] rounded-xl border border-slate-200/80 bg-white px-5 py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] max-[1100px]:right-[4%] max-[900px]:hidden">
            <div className="mb-1 flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <i key={i} className="fas fa-star text-[0.7rem] text-[#c9952c]"></i>
              ))}
            </div>
            <p className="m-0 text-[0.95rem] font-bold text-[#0f1b2d]">4.9/5</p>
            <p className="m-0 text-[0.68rem] text-slate-500">Customer Rating</p>
            <p className="m-0 text-[0.62rem] text-slate-400">Based on 1.2k+ reviews</p>
          </div>

          {/* Floating card: Verified Stock */}
          <div className="absolute right-[2%] top-[38%] z-[10] flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] max-[1100px]:right-0 max-[900px]:hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <i className="fas fa-check text-[0.8rem] text-emerald-600"></i>
            </div>
            <div>
              <p className="m-0 text-[0.78rem] font-bold text-[#0f1b2d]">Verified Stock</p>
              <p className="m-0 text-[0.62rem] text-slate-500">Authentic & Inspected</p>
            </div>
          </div>

          {/* Floating card: Inspection Passed */}
          <div className="absolute right-[6%] bottom-[20%] z-[10] flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] max-[1100px]:right-[2%] max-[900px]:hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <i className="fas fa-check-double text-[0.8rem] text-emerald-600"></i>
            </div>
            <div>
              <p className="m-0 text-[0.78rem] font-bold text-[#0f1b2d]">Inspection Passed</p>
              <p className="m-0 text-[0.62rem] text-slate-500">150+ Point Checklist</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-9 left-1/2 z-[16] flex -translate-x-1/2 flex-col items-center gap-2 opacity-0 transition-opacity delay-[2600ms] duration-700 [.lux-on_&]:opacity-100 max-[900px]:hidden" aria-hidden="true">
          <div className="flex h-8 w-5 items-start justify-center rounded-full border-2 border-slate-400/50 pt-1.5">
            <div className="h-1.5 w-1.5 animate-[luxScrollBounce_1.6s_ease-in-out_infinite] rounded-full bg-slate-400/60" />
          </div>
          <span className="text-[0.6rem] uppercase tracking-[0.25em] text-slate-500">Scroll</span>
        </div>

        {/* Fade into page background */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[15] h-[140px] bg-gradient-to-b from-transparent to-[#f8fafc]" aria-hidden="true" />
      </section>

      {/* ── Trusted Brands Carousel ── */}
      <section className="relative z-10 border-b border-slate-200/60 bg-white/70 py-7 backdrop-blur-sm" aria-label="Trusted brands">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-5 text-center text-[0.68rem] font-bold uppercase tracking-[0.22em] text-slate-400">Trusted by Leading Brands</p>
        </div>
        <div className="group relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 z-[2] h-full w-20 bg-gradient-to-r from-white to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute right-0 top-0 z-[2] h-full w-20 bg-gradient-to-l from-white to-transparent" aria-hidden="true" />
          <div className="brand-track flex w-max gap-10 items-center px-5 group-hover:[animation-play-state:paused]">
            {[
              '/brands/toyota.png',
              '/brands/bmw.png',
              '/brands/mercedes-benz.png',
              '/brands/lexus.png',
              '/brands/honda.png',
              '/brands/ford.png',
              '/brands/audi-logo-2016.png',
              '/brands/porsche-logo-2014.png',
              '/brands/nissan-logo-2020.png',
              '/brands/hyundai-logo-2011.png',
              '/brands/kia-logo-2021.png',
              '/brands/volkswagen-logo.png',
              '/brands/land-rover-logo-2021.png',
              '/brands/subaru.png',
              '/brands/mazda-logo-2018.v.png',
              '/brands/chevrolet-logo-2013.png',
              '/brands/ferrari-logo.png',
              '/brands/lamborghini.png',
              '/brands/maserati-logo-2020.png',
              '/brands/bentley-logo-2025.png',
            ].map((src) => (
              <img
                key={src}
                src={src}
                alt="Brand logo"
                className="h-9 w-auto shrink-0 object-contain opacity-50 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 sm:h-10"
                loading="lazy"
              />
            ))}
            {/* Duplicate set for seamless loop */}
            {[
              '/brands/toyota.png',
              '/brands/bmw.png',
              '/brands/mercedes-benz.png',
              '/brands/lexus.png',
              '/brands/honda.png',
              '/brands/ford.png',
              '/brands/audi-logo-2016.png',
              '/brands/porsche-logo-2014.png',
              '/brands/nissan-logo-2020.png',
              '/brands/hyundai-logo-2011.png',
              '/brands/kia-logo-2021.png',
              '/brands/volkswagen-logo.png',
              '/brands/land-rover-logo-2021.png',
              '/brands/subaru.png',
              '/brands/mazda-logo-2018.v.png',
              '/brands/chevrolet-logo-2013.png',
              '/brands/ferrari-logo.png',
              '/brands/lamborghini.png',
              '/brands/maserati-logo-2020.png',
              '/brands/bentley-logo-2025.png',
            ].map((src, i) => (
              <img
                key={`dup-${src}`}
                src={src}
                alt="Brand logo"
                className="h-9 w-auto shrink-0 object-contain opacity-50 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 sm:h-10"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>

      <main className="relative z-10 space-y-16 pt-16 pb-20">
        {/* Featured Items — Premium Split Panel */}
        <section className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="badge-primary text-xs mb-2 inline-block">Our Collection</span>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Featured Stock</h2>
              <p className="text-text-secondary text-sm mt-1">Vehicles, parts, and accessories in one place</p>
            </div>
            <Link to="/sales" className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
              View All <i className="fas fa-arrow-right text-xs"></i>
            </Link>
          </div>

          <div className="relative grid min-h-[500px] grid-cols-[1fr_320px] overflow-hidden rounded-lg border border-blue-300/20 bg-slate-950 shadow-[0_36px_110px_rgba(2,6,23,0.45),0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.12)] before:pointer-events-none before:absolute before:inset-0 before:z-[3] before:bg-[linear-gradient(110deg,transparent_0%,rgba(96,165,250,0.08)_42%,transparent_72%)] after:pointer-events-none after:absolute after:inset-3.5 after:z-[4] after:border after:border-blue-100/10 max-md:grid-cols-1 max-md:after:inset-2.5">
            {/* Main image */}
            <div className="group relative overflow-hidden">
              <img
                src={featuredItems[currentSlide].image}
                alt={featuredItems[currentSlide].name}
                className="block h-full min-h-[420px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] max-md:min-h-[340px] [filter:saturate(0.92)_contrast(1.08)]"
                loading="eager"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#01050e]/95 via-[#081631]/70 via-[44%] to-transparent p-[34px] max-md:p-7">
                <div className="absolute left-[34px] right-[34px] top-7 flex justify-between gap-3 text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-blue-100/70 max-md:left-7 max-md:right-7 max-md:top-[22px] max-md:text-[0.55rem] max-md:tracking-[0.12em]">
                  <span>Signature Selection</span>
                  <span>Verified Stock</span>
                </div>
                <span className={`mb-3 inline-block w-fit rounded border border-white/20 px-3.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.06em] backdrop-blur ${typeBadgeClasses[featuredItems[currentSlide].type]}`}>
                  {featuredItems[currentSlide].badge}
                </span>
                <h3 className="m-0 mb-1.5 text-[clamp(2rem,4vw,3.35rem)] font-extrabold leading-[1.15] tracking-[-0.03em] text-white max-md:text-[2rem]">{featuredItems[currentSlide].name}</h3>
                <p className="m-0 mb-[18px] text-[clamp(1.2rem,2vw,1.65rem)] font-extrabold tracking-[-0.01em] text-blue-200">{featuredItems[currentSlide].price}</p>
                <div className="flex flex-wrap gap-2.5" aria-label="Listing highlights">
                  <span className="inline-flex items-center gap-[7px] rounded-[5px] border border-blue-300/20 bg-slate-950/70 px-[11px] py-2 text-[0.72rem] font-bold text-slate-100/80 max-md:px-2.5 max-md:py-[7px] max-md:text-[0.68rem]"><i className="fas fa-shield-alt text-blue-300"></i> Certified</span>
                  <span className="inline-flex items-center gap-[7px] rounded-[5px] border border-blue-300/20 bg-slate-950/70 px-[11px] py-2 text-[0.72rem] font-bold text-slate-100/80 max-md:px-2.5 max-md:py-[7px] max-md:text-[0.68rem]"><i className="fas fa-gem text-blue-300"></i> Premium Grade</span>
                  <span className="inline-flex items-center gap-[7px] rounded-[5px] border border-blue-300/20 bg-slate-950/70 px-[11px] py-2 text-[0.72rem] font-bold text-slate-100/80 max-md:px-2.5 max-md:py-[7px] max-md:text-[0.68rem]"><i className="fas fa-headset text-blue-300"></i> Concierge Support</span>
                </div>
              </div>
              <button onClick={prevSlide} className="absolute left-3.5 top-1/2 z-[5] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-blue-300/20 bg-slate-950/60 text-[0.85rem] text-white backdrop-blur transition hover:border-blue-100/60 hover:bg-blue-600/90" aria-label="Previous item">
                <i className="fas fa-chevron-left"></i>
              </button>
              <button onClick={nextSlide} className="absolute right-3.5 top-1/2 z-[5] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-blue-300/20 bg-slate-950/60 text-[0.85rem] text-white backdrop-blur transition hover:border-blue-100/60 hover:bg-blue-600/90" aria-label="Next item">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>

            {/* Item list */}
            <div className="flex flex-col overflow-y-auto border-l border-blue-300/15 bg-gradient-to-b from-[#081631] to-slate-950 max-md:max-h-[280px] max-md:border-l-0 max-md:border-t max-md:border-white/10">
              <p className="border-b border-slate-400/10 px-5 pb-4 pt-[22px] text-[0.68rem] font-bold uppercase tracking-[0.1em] text-blue-100/50">All Items</p>
              {featuredItems.map((item, index) => (
                <button
                  key={item.name}
                  onClick={() => goToSlide(index)}
                  className={`flex w-full cursor-pointer items-center gap-3 border-0 border-b border-slate-400/10 border-l-[3px] px-5 py-4 text-left transition hover:bg-blue-400/10 ${currentSlide === index ? 'border-l-blue-400 bg-gradient-to-r from-blue-600/20 to-slate-900/20' : 'border-l-transparent bg-transparent'}`}
                >
                  <img src={item.image} alt={item.name} className={`h-[50px] w-[68px] shrink-0 rounded-[5px] object-cover transition ${currentSlide === index ? 'scale-[1.02] opacity-100' : 'opacity-75 hover:opacity-100'}`} />
                  <div className="min-w-0 flex-1">
                    <span className={`mb-[3px] inline-block rounded px-[7px] py-px text-[0.58rem] font-bold uppercase tracking-[0.05em] ${itemTagClasses[item.type]}`}>{item.badge}</span>
                    <p className={`m-0 mb-0.5 truncate text-[0.84rem] font-semibold transition ${currentSlide === index ? 'text-white' : 'text-slate-300'}`}>{item.name}</p>
                    <p className={`m-0 text-[0.72rem] ${currentSlide === index ? 'text-blue-300' : 'text-slate-500'}`}>{item.price}</p>
                  </div>
                  <i className={`fas fa-chevron-right shrink-0 text-[0.65rem] transition ${currentSlide === index ? 'text-blue-300' : 'text-white/15'}`}></i>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {quickStats.map((stat) => (
              <div key={stat.label} className="glass-card p-4 text-center sm:p-6">
                <p className="text-2xl font-bold text-text-primary sm:text-3xl">{stat.value}</p>
                <p className="mt-2 text-[0.8rem] font-semibold leading-tight text-text-primary sm:text-sm">{stat.label}</p>
                <p className="mt-1 text-[0.68rem] leading-snug text-text-muted sm:text-xs">{stat.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Vehicles Section */}
        <section className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="badge-primary text-xs mb-2 inline-block">Premium Inventory</span>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Featured Vehicles</h2>
              <p className="text-text-secondary text-sm mt-1">Selected options for buyers who want fewer surprises</p>
            </div>
            <Link to="/sales" className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
              View All Inventory <i className="fas fa-arrow-right text-xs"></i>
            </Link>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredItems.filter(item => item.type === 'vehicle').map((vehicle) => (
              <div key={vehicle.name} className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-400/20 bg-gradient-to-b from-slate-900 to-[#030a18] shadow-[0_22px_58px_rgba(2,6,23,0.36)] transition duration-300 before:pointer-events-none before:absolute before:inset-0 before:z-[2] before:border-t before:border-white/10 hover:-translate-y-2 hover:border-blue-400/30 hover:shadow-[0_34px_80px_rgba(2,6,23,0.5),0_0_0_1px_rgba(96,165,250,0.18)]">
                {/* Image with gradient bleed */}
                <div className="relative h-56 shrink-0 overflow-hidden bg-slate-950 after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[120px] after:bg-[linear-gradient(to_bottom,transparent_0%,rgba(2,6,23,0.2)_45%,#071225_100%)]">
                  <img src={vehicle.image} alt={vehicle.name} className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06] [filter:saturate(0.92)_contrast(1.06)]" />
                  <span className="absolute right-3.5 top-3.5 z-[2] rounded border border-blue-300/40 bg-slate-950/75 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-blue-100 backdrop-blur">Available</span>
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col px-[22px] pb-[22px]">
                  <h3 className="m-0 mb-1.5 text-[1.08rem] font-bold tracking-[-0.01em] text-slate-50">{vehicle.name}</h3>
                  <p className="m-0 mb-4 text-[1.45rem] font-extrabold tracking-[-0.02em] text-blue-200">{vehicle.price}</p>

                  <div className="mb-3.5 h-px bg-gradient-to-r from-blue-400/30 to-white/5" />

                  <div className="mb-[18px] flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-[5px] border border-slate-400/15 bg-slate-900/70 px-2.5 py-1 text-[0.7rem] text-slate-200/65 [&_i]:text-[0.65rem] [&_i]:text-blue-400"><i className="fas fa-gas-pump"></i> Petrol</span>
                    <span className="inline-flex items-center gap-1 rounded-[5px] border border-slate-400/15 bg-slate-900/70 px-2.5 py-1 text-[0.7rem] text-slate-200/65 [&_i]:text-[0.65rem] [&_i]:text-blue-400"><i className="fas fa-cog"></i> Automatic</span>
                    <span className="inline-flex items-center gap-1 rounded-[5px] border border-slate-400/15 bg-slate-900/70 px-2.5 py-1 text-[0.7rem] text-slate-200/65 [&_i]:text-[0.65rem] [&_i]:text-blue-400"><i className="fas fa-car"></i> Used</span>
                  </div>

                  <div className="mt-auto flex gap-2.5">
                    <a
                      href="https://wa.me/2347060882711"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-[7px] rounded-md bg-gradient-to-br from-blue-700 to-blue-500 px-4 py-[11px] text-[0.82rem] font-bold tracking-[0.03em] text-white no-underline shadow-[0_12px_30px_rgba(37,99,235,0.3)] transition hover:-translate-y-px hover:text-white hover:brightness-110 hover:shadow-[0_16px_38px_rgba(37,99,235,0.42)]"
                    >
                      <i className="fab fa-whatsapp"></i>
                      Inquire Now
                    </a>
                    <button className="inline-flex items-center justify-center gap-1.5 rounded-md border border-white/10 bg-transparent px-4 py-[11px] text-[0.82rem] font-semibold text-white/55 transition hover:border-blue-400/40 hover:text-blue-200">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Our Services Section ── */}
        <section className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <span className="badge-primary text-xs mb-2 inline-block">What We Offer</span>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">What We Handle</h2>
            <p className="text-text-secondary mt-2">Sales, parts, inspections, and ownership support</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {serviceItems.map((service) => (
              <div key={service.title} className="group overflow-hidden rounded-lg border border-slate-200/90 bg-white/80 shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-[5px] hover:border-blue-600/30 hover:shadow-[0_26px_64px_rgba(15,23,42,0.14)]">
                <div className="relative h-[178px] overflow-hidden bg-slate-900">
                  <img src={service.image} alt={service.title} className="block h-full w-full scale-[1.01] object-cover transition duration-500 group-hover:scale-[1.07] [filter:saturate(0.96)_contrast(1.04)]" loading="lazy" />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,23,0.72),rgba(2,6,23,0.05)_68%),linear-gradient(120deg,rgba(37,99,235,0.28),transparent_58%)]" />
                  <div className="absolute bottom-4 left-[18px] inline-flex h-[46px] w-[46px] items-center justify-center rounded-lg border border-white/75 bg-white/95 text-primary shadow-[0_12px_30px_rgba(2,6,23,0.18)]">
                    <i className={`${service.icon}`} aria-hidden="true"></i>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="m-0 mb-2 text-[1.05rem] font-extrabold tracking-normal text-text-primary">{service.title}</h3>
                  <p className="m-0 mb-[18px] min-h-[72px] text-[0.88rem] leading-[1.65] text-text-secondary">{service.description}</p>
                  {service.link.startsWith('http') ? (
                    <a
                      href={service.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-[7px] text-[0.86rem] font-extrabold text-primary no-underline [&_i]:text-[0.72rem] [&_i]:transition-transform hover:[&_i]:translate-x-[3px]"
                    >
                      {service.linkText}
                      <i className="fas fa-arrow-right" aria-hidden="true"></i>
                    </a>
                  ) : (
                    <Link
                      to={service.link}
                      className="inline-flex items-center gap-[7px] text-[0.86rem] font-extrabold text-primary no-underline [&_i]:text-[0.72rem] [&_i]:transition-transform hover:[&_i]:translate-x-[3px]"
                    >
                      {service.linkText}
                      <i className="fas fa-arrow-right" aria-hidden="true"></i>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Why Choose Biltronix</h2>
            <p className="text-text-secondary mt-2">A calmer way to buy, maintain, and inspect</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {featureBoxes.map((feature) => (
              <div key={feature.title} className="glass-card p-6 group hover:shadow-glass-hover">
                <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                  <i className={`${feature.icon} text-primary text-lg`}></i>
                </div>
                <h3 className="text-lg font-semibold text-text-primary">{feature.title}</h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">{feature.copy}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pre-Purchase Inspection Hero Banner - For Mechanics */}
        <section className="container mx-auto px-4 md:px-6">
          <div className="relative rounded-2xl overflow-hidden shadow-glass-xl" style={{ height: '400px' }}>
            {/* Background Image - Professional mechanic/engineering */}
            <img 
              src="/prepurchase-inspection.jpg"
              alt="Professional Vehicle Inspection"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/40"></div>
            
            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="max-w-xl px-8 md:px-12">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <i className="fas fa-clipboard-list text-white"></i>
                  </div>
                  <span className="text-white/80 text-sm font-medium">For Mechanics & Inspectors</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Digital Inspection Portal
                </h2>
                <p className="text-white/80 text-lg mb-6 leading-relaxed">
                  Professional tool for mechanics to conduct comprehensive pre-purchase inspections. 
                  Generate detailed reports with photos, checklists, and digital signatures — all stored securely.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link 
                    to="/inspection-app" 
                    className="btn-primary px-6 py-3 rounded-lg font-semibold"
                  >
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Access Portal
                  </Link>
                  <a
                    href="https://wa.me/2347060882711"
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 rounded-lg font-semibold border border-white/30 text-white hover:bg-white/10 transition-colors"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
          </div>
        </section>

        {/* Inspection Features */}
        <section className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <span className="badge-primary text-xs mb-2 inline-block">What's Included</span>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Comprehensive Inspection Tools</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: 'fas fa-clipboard-check', title: 'Digital Checklists', desc: '150+ point inspection templates' },
              { icon: 'fas fa-camera', title: 'Photo Documentation', desc: 'Capture and attach evidence photos' },
              { icon: 'fas fa-file-signature', title: 'Digital Signatures', desc: 'Sign and certify reports electronically' },
              { icon: 'fas fa-file-pdf', title: 'Instant PDF Reports', desc: 'Generate professional reports instantly' },
            ].map((item) => (
              <div key={item.title} className="glass-card p-6 text-center group hover:shadow-glass-hover">
                <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors">
                  <i className={`${item.icon} text-primary text-xl`}></i>
                </div>
                <h3 className="text-lg font-semibold text-text-primary">{item.title}</h3>
                <p className="text-sm text-text-secondary mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Store Highlights with Image Backgrounds */}
        <section className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Explore the Range</h2>
              <p className="text-text-secondary text-sm mt-1">Essentials selected for reliability and finish</p>
            </div>
            <Link to="/sales" className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
              View All <i className="fas fa-arrow-right text-xs"></i>
            </Link>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {highlightCards.map((card) => (
              <div key={card.title} className="relative rounded-xl overflow-hidden group hover:shadow-glass-hover transition-all" style={{ height: '280px' }}>
                {/* Background Image */}
                <img 
                  src={card.image} 
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end p-6">
                  <span className="badge-primary text-xs w-fit mb-2">{card.emphasis}</span>
                  <h3 className="text-xl font-bold text-white">{card.title}</h3>
                  <p className="text-white/80 text-sm mt-2">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section with Image Background */}
        <section className="container mx-auto px-4 md:px-6">
          <div className="relative rounded-2xl overflow-hidden shadow-glass-xl" style={{ height: '300px' }}>
            {/* Background Image - Professional automotive */}
            <img 
              src="/hero-car-original-withbackground.jpeg"
              alt="Biltronix premium vehicle"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/86 to-blue-950/60"></div>
            
            {/* Content */}
            <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
              <div className="max-w-2xl">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Ready for a Better Buying Decision?
                </h2>
                <p className="text-white/90 text-lg mb-6">
                  Speak with Biltronix for vehicle sourcing, parts guidance, or inspection support.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="https://wa.me/2347060882711"
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 rounded-lg font-semibold bg-white text-primary hover:bg-white/90 transition-colors"
                  >
                    <i className="fab fa-whatsapp mr-2"></i>
                    Chat on WhatsApp
                  </a>
                  <Link to="/sales" className="px-6 py-3 rounded-lg font-semibold border-2 border-white text-white hover:bg-white/10 transition-colors">
                    Browse Inventory
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FloatingWhatsApp />

      {/* Professional Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.jpg" alt="Biltronix" className="h-10 w-10 rounded-lg" />
                <div>
                  <span className="text-lg font-bold">Biltronix</span>
                  <span className="text-primary ml-1">Automobile</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your trusted partner for premium vehicles, genuine parts, and professional automotive services in Nigeria.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/sales" className="text-slate-400 hover:text-white transition-colors">Browse Inventory</Link></li>
                <li><Link to="/car-tips" className="text-slate-400 hover:text-white transition-colors">Car Tips</Link></li>
                <li><Link to="/inspection-app" className="text-slate-400 hover:text-white transition-colors">Inspection Portal</Link></li>
                <li><Link to="/admin" className="text-slate-400 hover:text-white transition-colors">Admin Dashboard</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Our Services</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-slate-400">Vehicle Sales</span></li>
                <li><span className="text-slate-400">Genuine Parts</span></li>
                <li><span className="text-slate-400">Pre-Purchase Inspection</span></li>
                <li><span className="text-slate-400">Expert Consultation</span></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Contact Us</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-slate-400">
                  <i className="fas fa-phone text-primary"></i>
                  <span>+234 706 088 2711</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <i className="fas fa-envelope text-primary"></i>
                  <span>info@biltronix.com</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <i className="fas fa-clock text-primary"></i>
                  <span>Mon - Sat: 9AM - 7PM</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Biltronix Automobile. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://wa.me/2347060882711" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-whatsapp text-xl"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

