import React, { useMemo, useState } from 'react';
import SiteHeader from '../components/layout/SiteHeader.jsx';
import FloatingWhatsApp from '../components/static/FloatingWhatsApp.jsx';

const productFilters = [
  { label: 'All Products', value: 'all' },
  { label: 'Vehicles', value: 'vehicle' },
  { label: 'Parts', value: 'part' },
  { label: 'Accessories', value: 'accessory' },
];

const storeProducts = [
  // Vehicles
  {
    title: 'Lexus RX 350 AWD',
    description: 'Premium luxury SUV with leather interior, navigation system, and advanced safety features. Fully inspected and certified.',
    category: 'vehicle',
    price: 'NGN 28,500,000',
    badge: 'Vehicles',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop',
  },
  {
    title: 'Mercedes-Benz GLE 450',
    description: 'Executive SUV with panoramic sunroof, premium sound system, and MBUX infotainment. Low mileage, pristine condition.',
    category: 'vehicle',
    price: 'NGN 45,000,000',
    badge: 'Vehicles',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop',
  },
  {
    title: 'Toyota Land Cruiser Prado',
    description: 'Full-size luxury SUV with 4WD, third-row seating, and comprehensive service history. Perfect for Nigerian roads.',
    category: 'vehicle',
    price: 'NGN 52,000,000',
    badge: 'Vehicles',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop',
  },
  {
    title: 'Honda CR-V EX-L',
    description: 'Compact SUV with excellent fuel economy, Honda Sensing safety suite, and spacious interior. Family-friendly choice.',
    category: 'vehicle',
    price: 'NGN 18,500,000',
    badge: 'Vehicles',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop',
  },
  {
    title: 'BMW X5 xDrive40i',
    description: 'Sports Activity Vehicle with twin-turbo engine, premium leather, and cutting-edge technology. Driving pleasure redefined.',
    category: 'vehicle',
    price: 'NGN 48,000,000',
    badge: 'Vehicles',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop',
  },
  // Parts
  {
    title: 'OEM Brake Pad Set',
    description: 'Genuine brake pads for superior stopping power and safety. Compatible with most Toyota and Lexus models.',
    category: 'part',
    price: 'NGN 62,000',
    badge: 'Parts',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop',
  },
  {
    title: 'Synthetic Motor Oil 5W-30',
    description: 'Premium full synthetic oil for optimal engine performance and longevity. 5-liter container.',
    category: 'part',
    price: 'NGN 28,500',
    badge: 'Parts',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop',
  },
  {
    title: 'Air Filter Kit',
    description: 'High-performance air filter for improved engine breathing and fuel efficiency. Easy installation.',
    category: 'part',
    price: 'NGN 15,000',
    badge: 'Parts',
    image: 'https://images.unsplash.com/photo-1517524285303-d6fc683dddf8?w=600&h=400&fit=crop',
  },
  // Accessories
  {
    title: 'Interior Protection Bundle',
    description: 'Premium seat covers, floor mats, and trim protection for daily drivers. Universal fit available.',
    category: 'accessory',
    price: 'NGN 24,800',
    badge: 'Accessories',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&h=400&fit=crop',
  },
  {
    title: '4K Dash Camera',
    description: 'Front and rear recording with night vision, GPS tracking, and parking mode. Essential for every driver.',
    category: 'accessory',
    price: 'NGN 85,000',
    badge: 'Accessories',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&h=400&fit=crop',
  },
];

export default function SalesPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return storeProducts.filter((product) => {
      const matchesFilter = activeFilter === 'all' || product.category === activeFilter;
      const matchesSearch =
        !normalizedSearch ||
        product.title.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search]);

  return (
    <div className="sales-dark-page">
      <SiteHeader />

      {/* ── Luxury Header Panel ── */}
      <div className="sales-header-panel">
        <div className="container mx-auto px-4 md:px-6">
          <span className="sales-header-badge">
            <span className="sales-header-pulse" aria-hidden="true" />
            Biltronix Store
          </span>

          <h1 className="sales-header-h1">
            Premium Vehicles &amp;{' '}
            <span className="lux-gold-text">Parts</span>
          </h1>

          <p className="sales-header-sub">
            Browse our curated selection of inspected vehicles, genuine parts,
            and premium accessories — every product backed by our quality guarantee.
          </p>

          {/* Filters + Search */}
          <div className="sales-filter-row">
            <div className="sales-filters">
              {productFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`sales-filter-btn${activeFilter === filter.value ? ' active' : ''}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="sales-search-wrap">
              <i className="fas fa-search" aria-hidden="true"></i>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vehicles, parts, accessories…"
                className="sales-search"
                aria-label="Search products"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Products Grid ── */}
      <main>
        <div className="container mx-auto px-4 md:px-6">
          <div className="sales-grid">
            {filteredProducts.length === 0 ? (
              <div className="sales-empty">
                <div className="sales-empty-icon">
                  <i className="fas fa-search" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' }}></i>
                </div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <article key={product.title} className="store-card">
                  {/* Image */}
                  <div className="store-card-img-wrap">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="store-card-img"
                    />
                    <span className={`store-card-badge store-card-badge--${product.category}`}>
                      {product.badge}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="store-card-body">
                    <h2 className="store-card-name">{product.title}</h2>
                    <p className="store-card-price">{product.price}</p>
                    <div className="store-card-divider" />
                    <p className="store-card-desc">{product.description}</p>

                    <div className="store-card-cta">
                      <a
                        href="https://wa.me/2347060882711"
                        target="_blank"
                        rel="noreferrer"
                        className="vcard-btn-primary"
                      >
                        <i className="fab fa-whatsapp" aria-hidden="true"></i>
                        Inquire Now
                      </a>
                      <button className="vcard-btn-ghost">
                        Details
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </main>

      <FloatingWhatsApp />

      {/* ── Dark Footer ── */}
      <footer className="sales-footer">
        <div className="container mx-auto px-4">
          <div className="sales-footer-inner">
            <span>Biltronix Store · Premium Vehicles &amp; Parts</span>
            <span>© {new Date().getFullYear()} Biltronix Automotive. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
