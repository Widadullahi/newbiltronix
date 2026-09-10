import React, { useMemo, useState } from 'react';
import SiteHeader from '../components/layout/SiteHeader.jsx';
import FloatingWhatsApp from '../components/static/FloatingWhatsApp.jsx';

const productFilters = [
  { label: 'All Products', value: 'all' },
  { label: 'Vehicles', value: 'vehicle' },
  { label: 'Parts', value: 'part' },
  { label: 'Accessories', value: 'accessory' },
];

const productMeta = {
  vehicle: {
    kicker: 'Verified unit',
    accent: 'from-primary-500/90 to-cyan-300/80',
    badgeClass: 'border-primary-200/40 bg-slate-1000/90 text-white',
    chips: ['Inspected', 'Clean title', 'Delivery ready'],
    tags: ['Petrol', 'Automatic', 'Used'],
    status: 'In Stock',
    perks: ['Inspected', 'Clean title', 'Delivery ready'],
  },
  part: {
    kicker: 'OEM-grade',
    accent: 'from-emerald-500/90 to-lime-300/80',
    badgeClass: 'border-emerald-200/40 bg-emerald-500/90 text-white',
    chips: ['Warranty', 'Fit checked', 'Fast pickup'],
    tags: ['OEM Grade', 'Genuine', 'Fast pickup'],
    status: 'In Stock',
    perks: ['Warranty', 'Fit checked', 'Fast pickup'],
  },
  accessory: {
    kicker: 'Premium add-on',
    accent: 'from-violet-500/90 to-fuchsia-300/80',
    badgeClass: 'border-violet-200/40 bg-violet-500/90 text-white',
    chips: ['Curated', 'Install support', 'In stock'],
    tags: ['Curated', 'Install support', 'Premium'],
    status: 'In Stock',
    perks: ['Curated', 'Install support', 'In stock'],
  },
};

const storeProducts = [
  // Vehicles
  {
    title: 'Lexus RX 350 AWD',
    description: 'Premium luxury SUV with leather interior, navigation system, and advanced safety features. Fully inspected and certified.',
    category: 'vehicle',
    mileage: '32,000 km',
    price: 'NGN 28,500,000',
    badge: 'Vehicles',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop',
  },
  {
    title: 'Mercedes-Benz GLE 450',
    description: 'Executive SUV with panoramic sunroof, premium sound system, and MBUX infotainment. Low mileage, pristine condition.',
    category: 'vehicle',
    mileage: '18,200 km',
    price: 'NGN 45,000,000',
    offerPrice: 'NGN 42,500,000',
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
    <div className="min-h-screen bg-white text-gray-900">
      <SiteHeader />

      {/* ── Store Header ── */}
      <div className="relative overflow-hidden border-b border-slate-200 bg-cover bg-center px-0 py-16" style={{ backgroundImage: "url('/new_design/background3.png')" }}>
        <div className="pointer-events-none absolute inset-0 bg-primary/30" aria-hidden="true" />
        <div className="relative container mx-auto px-4 md:px-6">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-100 backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" aria-hidden="true" />
            Biltronix Store
          </span>

          <h1 className="m-0 max-w-3xl font-heading text-[clamp(2.3rem,5vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-white">
            Premium Vehicles &amp;{' '}
            <span className="animate-[luxGoldShimmer_4s_linear_infinite] bg-[linear-gradient(90deg,#001F3F,#4a6fa5,#f0f4ff,#001F3F)] bg-[length:300%_auto] bg-clip-text text-transparent">Parts</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200/85">
            Browse our curated selection of inspected vehicles, genuine parts,
            and premium accessories — every product backed by our quality guarantee.
          </p>

          {/* Filters + Search */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {productFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`rounded-lg border px-4 py-2 text-sm font-bold transition ${activeFilter === filter.value ? 'border-primary bg-primary text-white shadow-[0_6px_18px_rgba(10,31,77,0.24)]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-gray-900'}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="flex min-w-[260px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <i className="fas fa-search text-slate-400" aria-hidden="true"></i>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vehicles, parts, accessories…"
                className="w-full border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-slate-400"
                aria-label="Search products"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Products Grid ── */}
      <main>
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 py-14 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <i className="fas fa-search text-slate-400" aria-hidden="true"></i>
                </div>
                <h3 className="mb-1 text-base font-semibold text-gray-900">No products found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const meta = productMeta[product.category] || productMeta.vehicle;
                const showStockPill = meta.status === 'In Stock';
                const itemBadges = showStockPill ? meta.perks : [meta.status, ...meta.perks];

                return (
                  <article
                    key={product.title}
                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.title}
                        loading="lazy"
                        className="h-48 w-full object-cover"
                      />

                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 backdrop-blur">
                        {product.badge}
                      </span>

                      <button className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur transition hover:bg-white" type="button" aria-label={`Save ${product.title}`}>
                        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="p-4">
                      <h2 className="mb-1 text-[15px] font-semibold leading-snug text-gray-900">
                        {product.title}
                      </h2>

                      {product.mileage && (
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                          <i className="fas fa-tachometer-alt text-gray-400" aria-hidden="true"></i>
                          {product.mileage}
                        </p>
                      )}

                      {product.offerPrice ? (
                        <p className="mb-3 flex items-baseline gap-2">
                          <span className="text-sm font-medium text-gray-400 line-through">{product.price}</span>
                          <span className="text-lg font-extrabold text-red-600">{product.offerPrice}</span>
                        </p>
                      ) : (
                        <p className="mb-3 text-lg font-bold text-gray-900">
                          {product.price}
                        </p>
                      )}

                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {meta.tags.map((tag) => (
                          <span key={tag} className="rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-500">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {itemBadges.map((badge) => (
                          <span key={badge} className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            {badge}
                          </span>
                        ))}

                        {showStockPill && (
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            In Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </main>

      <FloatingWhatsApp />

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-6 text-sm text-slate-500">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>Biltronix Store · Premium Vehicles &amp; Parts</span>
            <span>© {new Date().getFullYear()} Biltronix Automobile. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
