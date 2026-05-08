import React, { useState, useEffect } from 'react';
import SiteHeader from '../components/layout/SiteHeader.jsx';
import FloatingWhatsApp from '../components/static/FloatingWhatsApp.jsx';
import { Link } from 'react-router-dom';

const quickStats = [
  { value: '120+', label: 'Vehicles Ready', detail: 'Inspected & certified' },
  { value: '360+', label: 'Expert Tips', detail: 'Daily automotive advice' },
  { value: '15', label: 'Premium Brands', detail: 'Curated selection' },
  { value: '24/7', label: 'Support', detail: 'Always here to help' },
];

const featureBoxes = [
  {
    title: 'Transparent Sourcing',
    copy: 'Every listing includes complete history, inspection reports, and high-quality imagery.',
    icon: 'fas fa-search',
  },
  {
    title: 'Smart Alerts',
    copy: 'Get instantly notified when your desired make, model, or parts arrive in stock.',
    icon: 'fas fa-bell',
  },
  {
    title: 'Expert Guidance',
    copy: 'Professional maintenance advice written by certified automotive technicians.',
    icon: 'fas fa-cogs',
  },
];

const highlightCards = [
  {
    title: 'Vehicles',
    desc: 'Premium sedans, SUVs, and trucks — all inspected and road-ready.',
    emphasis: 'Certified Quality',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&h=400&fit=crop',
  },
  {
    title: 'Parts',
    desc: 'OEM-grade replacements, filters, brakes, batteries, and service kits.',
    emphasis: 'Genuine Parts',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop',
  },
  {
    title: 'Accessories',
    desc: 'Dash cams, seat covers, audio systems, and premium travel gear.',
    emphasis: 'Premium Selection',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&h=400&fit=crop',
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

// Featured items for hero carousel - includes vehicles, parts, and accessories
const featuredItems = [
  {
    type: 'vehicle',
    name: 'Lexus RX 350',
    price: 'NGN 28,500,000',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=500&fit=crop',
    badge: 'Vehicle',
  },
  {
    type: 'vehicle',
    name: 'Mercedes-Benz GLE',
    price: 'NGN 45,000,000',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=500&fit=crop',
    badge: 'Vehicle',
  },
  {
    type: 'vehicle',
    name: 'Toyota Land Cruiser',
    price: 'NGN 52,000,000',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=500&fit=crop',
    badge: 'Vehicle',
  },
  {
    type: 'part',
    name: 'OEM Brake Pad Set',
    price: 'NGN 62,000',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop',
    badge: 'Parts',
  },
  {
    type: 'part',
    name: 'Synthetic Motor Oil',
    price: 'NGN 28,500',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=500&fit=crop',
    badge: 'Parts',
  },
  {
    type: 'accessory',
    name: '4K Dash Camera',
    price: 'NGN 85,000',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&h=500&fit=crop',
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

      {/* ── Dark Luxury Hero ── */}
      <section
        className={`lux-section lux-hero${heroAnimated ? ' lux-on' : ''}`}
        aria-label="Biltronix hero"
      >
        <div className="lux-bg" aria-hidden="true" />

        {/* Speed lines */}
        <div className="lux-lines" aria-hidden="true">
          {HERO_LINES.map((l, i) => (
            <div
              key={i}
              className="lux-line"
              style={{ top: l.top, '--lw': l.width, '--ld': l.delay, '--ldur': l.dur, '--lo': l.opacity }}
            />
          ))}
        </div>

        {/* Left hero content */}
        <div className="lux-content lux-hero-content">
          <div className="lux-badge-row">
            <span className="lux-badge-pulse" aria-hidden="true" />
            <span className="lux-badge-text">Premium Vehicles · Parts · Accessories</span>
          </div>

          <h1 className="lux-hero-h1">
            Find Your Dream Car at{' '}
            <span className="lux-gold-text">Biltronix</span>
          </h1>

          <p className="lux-hero-p">
            Browse our curated selection of premium vehicles, genuine parts, and
            expert guidance — every vehicle thoroughly inspected and backed by our
            quality guarantee.
          </p>

          <div className="lux-hero-btns">
            <Link to="/sales" className="lux-btn">
              <i className="fas fa-car" aria-hidden="true"></i>
              Browse Inventory
            </Link>
            <Link to="/car-tips" className="lux-btn-ghost">
              Expert Tips
            </Link>
          </div>

          <div className="lux-trust">
            <span className="lux-trust-item">
              <i className="fas fa-shield-alt" aria-hidden="true"></i>
              Certified Quality
            </span>
            <span className="lux-trust-item">
              <i className="fas fa-truck" aria-hidden="true"></i>
              Fast Delivery
            </span>
            <span className="lux-trust-item">
              <i className="fas fa-headset" aria-hidden="true"></i>
              Expert Support
            </span>
          </div>
        </div>

        {/* Car stage */}
        <div className="lux-stage" aria-hidden="true">
          <div className="lux-spotlight" />
          <div className="lux-beam lux-beam-top" />
          <div className="lux-beam lux-beam-bot" />
          <div className="lux-glow" />
          <div className="lux-car-slide">
            <div className="lux-car-float">
              <img
                src="https://images.pexels.com/photos/33345481/pexels-photo-33345481.jpeg?auto=compress&cs=tinysrgb&w=1400"
                alt="Luxury sports car — Biltronix premium collection"
                className="lux-car-img"
                loading="eager"
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="lux-scroll-hint" aria-hidden="true">
          <span>Scroll</span>
          <div className="lux-scroll-dot" />
        </div>

        {/* Fade into page background */}
        <div className="lux-hero-fade" aria-hidden="true" />
      </section>

      <main className="relative z-10 space-y-16 pt-16 pb-20">
        {/* Featured Items — Premium Split Panel */}
        <section className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="badge-primary text-xs mb-2 inline-block">Our Collection</span>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Featured Items</h2>
              <p className="text-text-secondary text-sm mt-1">Vehicles, parts &amp; accessories</p>
            </div>
            <Link to="/sales" className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
              View All <i className="fas fa-arrow-right text-xs"></i>
            </Link>
          </div>

          <div className="feat-showcase">
            {/* Main image */}
            <div className="feat-main">
              <img
                src={featuredItems[currentSlide].image}
                alt={featuredItems[currentSlide].name}
                className="feat-main-img"
                loading="eager"
              />
              <div className="feat-main-overlay">
                <span className={`feat-type-badge ${featuredItems[currentSlide].type}`}>
                  {featuredItems[currentSlide].badge}
                </span>
                <h3 className="feat-main-name">{featuredItems[currentSlide].name}</h3>
                <p className="feat-main-price">{featuredItems[currentSlide].price}</p>
              </div>
              <button onClick={prevSlide} className="feat-arrow feat-arrow-prev" aria-label="Previous item">
                <i className="fas fa-chevron-left"></i>
              </button>
              <button onClick={nextSlide} className="feat-arrow feat-arrow-next" aria-label="Next item">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>

            {/* Item list */}
            <div className="feat-list">
              <p className="feat-list-header">All Items</p>
              {featuredItems.map((item, index) => (
                <button
                  key={item.name}
                  onClick={() => goToSlide(index)}
                  className={`feat-item${currentSlide === index ? ' feat-item-active' : ''}`}
                >
                  <img src={item.image} alt={item.name} className="feat-item-thumb" />
                  <div className="feat-item-info">
                    <span className={`feat-item-tag feat-item-tag--${item.type}`}>{item.badge}</span>
                    <p className="feat-item-name">{item.name}</p>
                    <p className="feat-item-price">{item.price}</p>
                  </div>
                  <i className="fas fa-chevron-right feat-chevron"></i>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 md:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickStats.map((stat) => (
              <div key={stat.label} className="glass-card p-6">
                <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
                <p className="mt-2 text-sm font-semibold text-text-primary">{stat.label}</p>
                <p className="text-xs text-text-muted mt-1">{stat.detail}</p>
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
              <p className="text-text-secondary text-sm mt-1">Handpicked selection of quality automobiles</p>
            </div>
            <Link to="/sales" className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
              View All Inventory <i className="fas fa-arrow-right text-xs"></i>
            </Link>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredItems.filter(item => item.type === 'vehicle').map((vehicle) => (
              <div key={vehicle.name} className="vcard">
                {/* Image with gradient bleed */}
                <div className="vcard-img-wrap">
                  <img src={vehicle.image} alt={vehicle.name} className="vcard-img" />
                  <span className="vcard-badge">Available</span>
                </div>

                {/* Card body */}
                <div className="vcard-body">
                  <h3 className="vcard-name">{vehicle.name}</h3>
                  <p className="vcard-price">{vehicle.price}</p>

                  <div className="vcard-divider" />

                  <div className="vcard-specs">
                    <span className="vcard-spec"><i className="fas fa-gas-pump"></i> Petrol</span>
                    <span className="vcard-spec"><i className="fas fa-cog"></i> Automatic</span>
                    <span className="vcard-spec"><i className="fas fa-car"></i> Used</span>
                  </div>

                  <div className="vcard-cta">
                    <a
                      href="https://wa.me/2347060882711"
                      target="_blank"
                      rel="noreferrer"
                      className="vcard-btn-primary"
                    >
                      <i className="fab fa-whatsapp"></i>
                      Inquire Now
                    </a>
                    <button className="vcard-btn-ghost">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Why Choose Biltronix</h2>
            <p className="text-text-secondary mt-2">Built on trust, powered by expertise</p>
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
              <h2 className="text-2xl font-bold text-text-primary">Explore Our Range</h2>
              <p className="text-text-secondary text-sm mt-1">Quality products, competitive prices</p>
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
              src="https://images.pexels.com/photos/29112761/pexels-photo-29112761.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop"
              alt="Luxury car showroom - Harrison Tincher on Pexels"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-600/80"></div>
            
            {/* Content */}
            <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
              <div className="max-w-2xl">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Ready to Find Your Perfect Car?
                </h2>
                <p className="text-white/90 text-lg mb-6">
                  Our team of automotive experts is ready to help you find the right vehicle.
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
                  <span className="text-primary ml-1">Automotive</span>
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
              © {new Date().getFullYear()} Biltronix Automotive. All rights reserved.
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