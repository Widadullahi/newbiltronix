import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { label: 'Home', to: '/', icon: 'fa-home' },
  { label: 'Store', to: '/sales', icon: 'fa-car' },
  { label: 'Car Tips', to: '/car-tips', icon: 'fa-lightbulb' },
  { label: 'Inspection', to: '/inspection-app', icon: 'fa-clipboard-check' },
  { label: 'Admin', to: '/admin', icon: 'fa-shield-alt' },
];

export default function SiteHeader() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [mobileMenuOpen]);

  return (
    <header>
      {/* Top Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs sm:text-sm">
        <div className="container mx-auto flex flex-wrap items-center justify-between px-4 py-2">
          <span className="flex items-center gap-2">
            <i className="fas fa-clock text-slate-400"></i>
            Mon - Sat - 09:00 AM - 07:00 PM
          </span>
          <span className="font-medium flex items-center gap-2">
            <i className="fab fa-whatsapp text-success"></i>
            +234 706 088 2711
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-[100] border-b border-glass-border bg-white/80 backdrop-blur-2xl" ref={menuRef}>
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="Biltronix" className="logo-brand-tint h-10 w-10 shrink-0 rounded-lg border border-slate-200 object-cover" />
            <div className="leading-tight">
              <span className="block font-luxury text-lg font-bold tracking-[0.12em] text-text-primary">BILTRONIX</span>
              <span className="block font-luxury text-xs font-bold tracking-[0.3em] text-primary">AUTOMOBILE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg font-luxury text-sm font-semibold transition-all ${
                  location.pathname === link.to
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:bg-primary hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a href="#install" className="ml-2 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-float transition hover:-translate-y-px hover:bg-slate-1000">
              <i className="fas fa-download mr-1.5"></i>
              Install App
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-[9px] border border-slate-200 bg-white text-text-primary shadow-sm lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={`block h-0.5 w-4 rounded-full bg-current transition ${mobileMenuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-4 rounded-full bg-current transition ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-4 rounded-full bg-current transition ${mobileMenuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>

        {/* Mobile Dropdown — compact absolute overlay */}
        {mobileMenuOpen && (
          <div className="absolute left-4 right-4 top-[calc(100%+8px)] z-[120] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-glass-xl lg:hidden" role="menu">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                role="menuitem"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 font-luxury text-sm font-semibold no-underline transition ${location.pathname === link.to ? 'bg-primary text-white' : 'text-slate-600 hover:bg-primary hover:text-white'}`}
              >
                <i className={`fas ${link.icon} w-5 text-center`} aria-hidden="true"></i>
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-slate-200" aria-hidden="true" />
            <a href="#install" className="flex items-center gap-3 bg-primary px-4 py-3 text-sm font-semibold text-white no-underline" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-download" aria-hidden="true"></i>
              Install App
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}

