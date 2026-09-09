import React, { useState, useEffect } from 'react';
import SiteHeader from '../components/layout/SiteHeader.jsx';
import FloatingWhatsApp from '../components/static/FloatingWhatsApp.jsx';
import { Link } from 'react-router-dom';

const quickStats = [
  { icon: 'fas fa-car-side', value: '120+', label: 'Ready Vehicles', detail: 'Every listing inspected' },
  { icon: 'fas fa-book-open', value: '360+', label: 'Advisory Guides', detail: 'Practical ownership notes' },
  { icon: 'fas fa-medal', value: '15', label: 'Trusted Brands', detail: 'Selected for reliability' },
  { icon: 'fas fa-headset', value: '24/7', label: 'Buyer Support', detail: 'Guidance when you need it' },
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

const heroServices = [
  { icon: 'fas fa-car', label: 'Vehicle Sales' },
  { icon: 'fas fa-cogs', label: 'Genuine Parts' },
  { icon: 'fas fa-clipboard-check', label: 'Pre-Purchase Inspection' },
  { icon: 'fas fa-wrench', label: 'Service & Maintenance' },
];

// Featured items - featured stock
const featuredItems = [
  {
    type: 'vehicle',
    name: 'Mercedes-Benz GLE 350',
    price: 'NGN 45,000,000',
    image: '/hero-car-original-withbackground.jpeg',
    badge: 'Vehicle',
    color: 'White',
    tags: ['Petrol', 'Automatic', 'Used'],
    status: 'Verified Stock',
    perks: ['Certified', 'Premium Grade', 'Concierge Support'],
  },
  {
    type: 'vehicle',
    name: 'Lexus RX 350',
    price: 'NGN 28,500,000',
    image: '/hero-car-original-withbackground.jpeg',
    badge: 'Vehicle',
    color: 'Black',
    tags: ['Petrol', 'Automatic', 'Used'],
    status: 'Verified Stock',
    perks: ['Certified', 'Premium Grade'],
  },
  {
    type: 'vehicle',
    name: 'Toyota Land Cruiser',
    price: 'NGN 85,000,000',
    image: '/hero-car-original-withbackground.jpeg',
    badge: 'Vehicle',
    color: 'Black',
    tags: ['Diesel', 'Automatic', 'Used'],
    status: 'Verified Stock',
    perks: ['Certified', 'Premium Grade', 'Concierge Support'],
  },
  {
    type: 'part',
    name: 'OEM Brake Pad Set',
    price: 'NGN 62,000',
    image: '/repair-troubleshooting.jpeg',
    badge: 'Parts',
    tags: ['OEM Grade', 'Front & Rear'],
    status: 'In Stock',
    perks: [],
  },
  {
    type: 'part',
    name: 'Synthetic Motor Oil',
    price: 'NGN 22,500',
    image: '/computerized Diagnostics.jpg',
    badge: 'Parts',
    tags: ['5W-30', '4L'],
    status: 'In Stock',
    perks: [],
  },
  {
    type: 'accessory',
    name: '4K Dash Camera',
    price: 'NGN 2,000,000',
    image: '/ecu-trouble-shooting-repair.jpeg',
    badge: 'Accessories',
    tags: ['4K', 'Wi-Fi', 'GPS'],
    status: 'In Stock',
    perks: [],
  },
];

export default function HomePage() {
  const [heroAnimated, setHeroAnimated] = useState(false);
  const [activeTab, setActiveTab] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');

  // Trigger hero animation shortly after mount
  useEffect(() => {
    const t = setTimeout(() => setHeroAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  const stockTabs = ['All Items', 'Vehicles', 'Parts', 'Accessories'];

  const filteredItems = featuredItems.filter((item) => {
    const matchesTab =
      activeTab === 'All Items' ||
      (activeTab === 'Vehicles' && item.type === 'vehicle') ||
      (activeTab === 'Parts' && item.type === 'part') ||
      (activeTab === 'Accessories' && item.type === 'accessory');
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      item.name.toLowerCase().includes(query) ||
      item.price.toLowerCase().includes(query);
    return matchesTab && matchesSearch;
  });

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
          <div className="mb-5 inline-flex translate-x-[-42px] items-center gap-2 rounded-full bg-primary px-4 py-2 opacity-0 shadow-[0_6px_20px_rgba(13,110,253,0.25)] [.lux-on_&]:animate-[heroTextIn_0.7s_cubic-bezier(0.22,1,0.36,1)_forwards] max-[900px]:mx-auto">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[0.6rem] text-primary">
              <i className="fas fa-star" aria-hidden="true"></i>
            </span>
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white">Premium Automobile Solutions</span>
          </div>

          <h1 className="m-0 mb-5 max-w-[680px] translate-x-[-42px] font-heading text-[clamp(2.5rem,5vw,4.2rem)] font-extrabold leading-[1.08] opacity-0 text-text-primary [.lux-on_&]:animate-[heroTextIn_0.75s_cubic-bezier(0.22,1,0.36,1)_0.12s_forwards] max-[900px]:mx-auto max-[640px]:text-[clamp(2rem,10vw,2.75rem)]">
            Find Your Dream Car at{' '}
            <span className="text-primary">Biltronix</span>
          </h1>

          <p className="mb-5 max-w-[470px] translate-x-[-42px] text-base opacity-0 leading-[1.78] text-slate-600 [.lux-on_&]:animate-[heroTextIn_0.75s_cubic-bezier(0.22,1,0.36,1)_0.24s_forwards] max-[900px]:mx-auto max-[900px]:max-w-[620px] max-[640px]:mb-[18px] max-[640px]:text-[0.95rem] max-[640px]:leading-7">
            Browse our curated selection of premium vehicles, genuine parts, and
            expert guidance. Every vehicle is thoroughly inspected and backed by
            our quality guarantee.
          </p>

          {/* Service pills */}
          <div className="mb-7 flex max-w-[580px] translate-x-[-42px] flex-wrap gap-2.5 opacity-0 [.lux-on_&]:animate-[heroTextIn_0.75s_cubic-bezier(0.22,1,0.36,1)_0.36s_forwards] max-[900px]:mx-auto max-[640px]:mb-5 max-[640px]:justify-center">
            {heroServices.map((service) => (
              <span key={service.label} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-4 py-2 text-[0.75rem] font-semibold text-primary shadow-sm backdrop-blur-sm max-[420px]:text-[0.68rem]">
                <i className={`${service.icon} w-4 text-center text-primary`} aria-hidden="true"></i>
                {service.label}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="mb-8 flex translate-x-[-42px] flex-wrap items-center gap-3.5 opacity-0 [.lux-on_&]:animate-[heroTextIn_0.75s_cubic-bezier(0.22,1,0.36,1)_0.48s_forwards] max-[900px]:mb-6 max-[900px]:justify-center max-[640px]:mb-[18px] max-[640px]:grid max-[640px]:grid-cols-1 max-[640px]:gap-2.5">
            <Link to="/sales" className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-primary px-7 py-3.5 text-[0.82rem] font-bold text-white no-underline shadow-[0_10px_28px_rgba(13,110,253,0.3)] transition hover:-translate-y-0.5 hover:bg-primary-500 hover:text-white max-[640px]:w-full">
              Browse Inventory
              <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </Link>
            <Link to="/car-tips" className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary px-7 py-3.5 text-[0.82rem] font-bold text-primary no-underline transition hover:bg-primary hover:text-white max-[640px]:w-full">
              Expert Tips
              <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex translate-x-[-42px] flex-wrap gap-5 opacity-0 [.lux-on_&]:animate-[heroTextIn_0.75s_cubic-bezier(0.22,1,0.36,1)_0.6s_forwards] max-[900px]:mb-0 max-[900px]:grid max-[900px]:grid-cols-3 max-[900px]:gap-2.5">
            <span className="flex items-center gap-2 text-[0.8rem] text-text-primary/80 max-[900px]:justify-center max-[900px]:rounded-lg max-[900px]:border max-[900px]:border-primary-200 max-[900px]:bg-white/60 max-[900px]:px-3 max-[900px]:py-2.5 max-[900px]:text-[0.72rem] max-[900px]:text-text-primary [&_i]:text-[0.9rem] [&_i]:text-primary">
                <i className="fas fa-shield-alt" aria-hidden="true"></i>
                <span><strong>Certified</strong> <span className="text-[0.7rem] text-slate-500">Quality Assured</span></span>
              </span>
            <span className="flex items-center gap-2 text-[0.8rem] text-text-primary/80 max-[900px]:justify-center max-[900px]:rounded-lg max-[900px]:border max-[900px]:border-primary-200 max-[900px]:bg-white/60 max-[900px]:px-3 max-[900px]:py-2.5 max-[900px]:text-[0.72rem] max-[900px]:text-text-primary [&_i]:text-[0.9rem] [&_i]:text-primary">
                <i className="fas fa-truck" aria-hidden="true"></i>
                <span><strong>Fast Delivery</strong> <span className="text-[0.7rem] text-slate-500">Across Nigeria</span></span>
              </span>
            <span className="flex items-center gap-2 text-[0.8rem] text-text-primary/80 max-[900px]:justify-center max-[900px]:rounded-lg max-[900px]:border max-[900px]:border-primary-200 max-[900px]:bg-white/60 max-[900px]:px-3 max-[900px]:py-2.5 max-[900px]:text-[0.72rem] max-[900px]:text-text-primary [&_i]:text-[0.9rem] [&_i]:text-primary">
                <i className="fas fa-headset" aria-hidden="true"></i>
                <span><strong>24/7 Support</strong> <span className="text-[0.7rem] text-slate-500">We're here to help</span></span>
              </span>
          </div>
        </div>

        {/* Car + floating cards */}
        <div className="absolute right-0 top-0 z-[5] flex h-full w-[55%] items-center justify-center max-[1100px]:w-[50%] max-[900px]:relative max-[900px]:right-auto max-[900px]:top-auto max-[900px]:mt-1 max-[900px]:h-[260px] max-[900px]:w-full max-[640px]:mt-0 max-[640px]:h-[180px] max-[420px]:h-[160px]" aria-hidden="true">
          {/* Car image */}
          <div className="absolute inset-0 flex items-end justify-center translate-x-[120%] opacity-0 [.lux-on_&]:animate-[heroCarIn_1.1s_cubic-bezier(0.22,1,0.36,1)_0.15s_forwards] max-[900px]:items-center">
            <img
              src="/new_design/car.png"
              alt="Premium vehicle — Biltronix collection"
              className="h-[85%] w-auto object-contain max-[900px]:h-[90%] max-[900px]:px-4 max-[640px]:px-2"
              loading="eager"
            />
          </div>

          {/* Floating card: Rating */}
          <div className="absolute right-[8%] top-[18%] z-[10] rounded-xl border border-slate-200/80 bg-white px-5 py-3.5 opacity-0 shadow-[0_8px_30px_rgba(0,0,0,0.12)] [.lux-on_&]:animate-[heroTextIn_0.7s_cubic-bezier(0.22,1,0.36,1)_0.85s_forwards] max-[1100px]:right-[4%] max-[900px]:hidden">
            <div className="mb-1 flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <i key={i} className="fas fa-star text-[0.7rem] text-primary"></i>
              ))}
            </div>
            <p className="m-0 text-[0.95rem] font-bold text-text-primary">4.9/5</p>
            <p className="m-0 text-[0.68rem] text-slate-500">Customer Rating</p>
            <p className="m-0 text-[0.62rem] text-slate-400">Based on 1.2k+ reviews</p>
          </div>

          {/* Floating card: Verified Stock */}
          <div className="absolute right-[2%] top-[38%] z-[10] flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 opacity-0 shadow-[0_8px_30px_rgba(0,0,0,0.12)] [.lux-on_&]:animate-[heroTextIn_0.7s_cubic-bezier(0.22,1,0.36,1)_1s_forwards] max-[1100px]:right-0 max-[900px]:hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100">
              <i className="fas fa-check text-[0.8rem] text-primary"></i>
            </div>
            <div>
              <p className="m-0 text-[0.78rem] font-bold text-text-primary">Verified Stock</p>
              <p className="m-0 text-[0.62rem] text-slate-500">Authentic & Inspected</p>
            </div>
          </div>

          {/* Floating card: Inspection Passed */}
          <div className="absolute right-[6%] bottom-[20%] z-[10] flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 opacity-0 shadow-[0_8px_30px_rgba(0,0,0,0.12)] [.lux-on_&]:animate-[heroTextIn_0.7s_cubic-bezier(0.22,1,0.36,1)_1.15s_forwards] max-[1100px]:right-[2%] max-[900px]:hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100">
              <i className="fas fa-check-double text-[0.8rem] text-primary"></i>
            </div>
            <div>
              <p className="m-0 text-[0.78rem] font-bold text-text-primary">Inspection Passed</p>
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
        {/* Featured Stock Section */}
        <section className="container mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-primary mb-2 inline-block">Our Collection</span>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Featured Stock</h2>
              <p className="text-text-secondary text-sm mt-1">Vehicles, parts, and accessories in one place</p>
            </div>
            <div className="relative w-full lg:w-[340px]">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" aria-hidden="true"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for vehicles, parts or accessories..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-text-primary shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {stockTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-4 py-2 text-[0.82rem] font-semibold transition ${
                    activeTab === tab
                      ? 'bg-primary text-white shadow-[0_6px_18px_rgba(13,110,253,0.3)]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-text-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Link to="/sales" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary no-underline hover:text-primary-700">
              View All <i className="fas fa-arrow-right text-xs" aria-hidden="true"></i>
            </Link>
          </div>

          {/* Product grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <article
                  key={item.name}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(15,23,42,0.13)]"
                >
                  <div className="relative h-52 shrink-0 overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      loading="lazy"
                    />
                    <span className="absolute left-3 top-3 rounded-md bg-white/95 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-slate-700 shadow-sm backdrop-blur">
                      {item.badge}
                    </span>
                    <span
                      className={`absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[0.68rem] font-bold text-white shadow-sm ${
                        item.status === 'In Stock' ? 'bg-success' : 'bg-sky-600'
                      }`}
                    >
                      <i
                        className={`fa-solid ${item.status === 'In Stock' ? 'fa-check-circle' : 'fa-shield-halved'}`}
                        aria-hidden="true"
                      ></i>
                      {item.status}
                    </span>
                    <button
                      aria-label={`Add ${item.name} to wishlist`}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-400 shadow-sm backdrop-blur transition hover:text-rose-500"
                    >
                      <i className="fa-regular fa-heart" aria-hidden="true"></i>
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="m-0 mb-1.5 text-[1.05rem] font-bold tracking-[-0.01em] text-text-primary">
                      {item.color ? `${item.color} ${item.name}` : item.name}
                    </h3>
                    <p className="m-0 mb-4 text-[1.3rem] font-extrabold tracking-[-0.01em] text-primary">{item.price}</p>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.7rem] font-semibold text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {item.perks.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-1.5">
                        {item.perks.map((perk) => (
                          <span key={perk} className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-success">
                            <i className="fa-solid fa-circle-check text-[0.6rem]" aria-hidden="true"></i>
                            {perk}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto flex gap-2.5">
                      <a
                        href="https://wa.me/2347060882711"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[0.82rem] font-bold text-white no-underline shadow-[0_12px_28px_rgba(13,110,253,0.3)] transition hover:bg-primary-700 hover:shadow-[0_16px_34px_rgba(13,110,253,0.4)]"
                      >
                        <i className="fab fa-whatsapp" aria-hidden="true"></i>
                        Inquire Now
                      </a>
                      <button className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[0.82rem] font-semibold text-slate-600 transition hover:border-primary hover:text-primary">
                        Details <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                No items match “{searchQuery}”. Try a different search.
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {quickStats.map((stat) => (
              <div key={stat.label} className="glass-card p-5 text-center sm:p-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-lg text-primary group-hover:bg-primary-100">
                  <i className={stat.icon} aria-hidden="true"></i>
                </div>
                <p className="text-2xl font-bold text-text-primary sm:text-3xl">{stat.value}</p>
                <p className="mt-2 text-[0.8rem] font-semibold leading-tight text-text-primary sm:text-sm">{stat.label}</p>
                <p className="mt-1 text-[0.68rem] leading-snug text-text-muted sm:text-xs">{stat.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Vehicles Section */}
        <section className="container mx-auto px-4 md:px-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-primary mb-2 inline-block">Premium Inventory</span>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Featured Vehicles</h2>
              <p className="text-text-secondary text-sm mt-1">Selected options for buyers who want fewer surprises</p>
            </div>
            <Link to="/sales" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary no-underline hover:text-primary-700">
              View All Inventory <i className="fas fa-arrow-right text-xs" aria-hidden="true"></i>
            </Link>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredItems.filter(item => item.type === 'vehicle').map((vehicle) => (
              <div key={vehicle.name} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_64px_rgba(15,23,42,0.13)]">
                {/* Image */}
                <div className="relative h-56 shrink-0 overflow-hidden bg-slate-100">
                  <img src={vehicle.image} alt={vehicle.name} className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
                  <span className="absolute left-3 top-3 rounded-md bg-white/95 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-slate-700 shadow-sm backdrop-blur">{vehicle.color}</span>
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-success px-2.5 py-1 text-[0.68rem] font-bold text-white shadow-sm">
                    <i className="fa-solid fa-circle-check text-[0.6rem]" aria-hidden="true"></i>
                    Available
                  </span>
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="m-0 mb-1.5 text-[1.08rem] font-bold tracking-[-0.01em] text-text-primary">{vehicle.name}</h3>
                  <p className="m-0 mb-4 text-[1.3rem] font-extrabold tracking-[-0.01em] text-primary">{vehicle.price}</p>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {vehicle.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.7rem] font-semibold text-slate-600">{tag}</span>
                    ))}
                  </div>

                  <div className="mt-auto flex gap-2.5">
                    <a
                      href="https://wa.me/2347060882711"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[0.82rem] font-bold text-white no-underline shadow-[0_12px_28px_rgba(13,110,253,0.3)] transition hover:bg-primary-700 hover:shadow-[0_16px_34px_rgba(13,110,253,0.4)]"
                    >
                      <i className="fab fa-whatsapp" aria-hidden="true"></i>
                      Inquire Now
                    </a>
                    <Link to="/sales" className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[0.82rem] font-semibold text-slate-600 no-underline transition hover:border-primary hover:text-primary">
                      Details <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
                    </Link>
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
                <img src="/logo.jpg" alt="Biltronix" className="logo-brand-tint h-10 w-10 rounded-lg" />
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

