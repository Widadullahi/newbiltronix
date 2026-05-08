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
            <i className="fas fa-clock text-primary-400"></i>
            Mon - Sat · 09:00 AM - 07:00 PM
          </span>
          <span className="font-medium flex items-center gap-2">
            <i className="fab fa-whatsapp text-success"></i>
            +234 706 088 2711
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-glass" ref={menuRef}>
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Biltronix" className="h-10 w-10 rounded-lg border border-slate-200 object-cover" />
            <div>
              <span className="text-lg font-bold text-text-primary">Biltronix</span>
              <span className="text-primary ml-1 font-semibold">Automotive</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.to
                    ? 'bg-primary-50 text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a href="#install" className="ml-2 btn-primary px-5 py-2 text-sm">
              <i className="fas fa-download mr-1.5"></i>
              Install App
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="lg:hidden mobile-hamburger"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>

        {/* Mobile Dropdown — compact absolute overlay */}
        {mobileMenuOpen && (
          <div className="mobile-menu-dropdown lg:hidden" role="menu">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                role="menuitem"
                onClick={() => setMobileMenuOpen(false)}
                className={`mobile-menu-link${location.pathname === link.to ? ' active' : ''}`}
              >
                <i className={`fas ${link.icon} mobile-menu-icon`} aria-hidden="true"></i>
                {link.label}
              </Link>
            ))}
            <div className="mobile-menu-divider" aria-hidden="true" />
            <a href="#install" className="mobile-menu-install" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-download" aria-hidden="true"></i>
              Install App
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}