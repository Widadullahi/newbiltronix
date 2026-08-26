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
    accent: 'from-blue-500/90 to-cyan-300/80',
    badgeClass: 'border-blue-200/40 bg-blue-500/90 text-white',
    chips: ['Inspected', 'Clean title', 'Delivery ready'],
  },
  part: {
    kicker: 'OEM-grade',
    accent: 'from-emerald-500/90 to-lime-300/80',
    badgeClass: 'border-emerald-200/40 bg-emerald-500/90 text-white',
    chips: ['Warranty', 'Fit checked', 'Fast pickup'],
  },
  accessory: {
    kicker: 'Premium add-on',
    accent: 'from-violet-500/90 to-fuchsia-300/80',
    badgeClass: 'border-violet-200/40 bg-violet-500/90 text-white',
    chips: ['Curated', 'Install support', 'In stock'],
  },
};

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
    <div className="min-h-screen bg-[#030712] text-white">
      <SiteHeader />

      {/* ── Luxury Header Panel ── */}
      <div className="relative overflow-hidden border-b border-blue-300/10 bg-gradient-to-br from-slate-950 via-[#071225] to-[#020617] px-0 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-300" aria-hidden="true" />
            Biltronix Store
          </span>

          <h1 className="m-0 max-w-3xl font-heading text-[clamp(2.3rem,5vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-white">
            Premium Vehicles &amp;{' '}
            <span className="animate-[luxGoldShimmer_4s_linear_infinite] bg-[linear-gradient(90deg,#60a5fa,#93c5fd,#ffffff,#bfdbfe,#60a5fa)] bg-[length:300%_auto] bg-clip-text text-transparent">Parts</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300/80">
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
                  className={`rounded-md border border-white/10 px-4 py-2 text-sm font-bold transition ${activeFilter === filter.value ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="flex min-w-[260px] items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-slate-300">
              <i className="fas fa-search" aria-hidden="true"></i>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vehicles, parts, accessories…"
                className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                aria-label="Search products"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Products Grid ── */}
      <main>
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 py-14 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full rounded-lg border border-white/10 bg-white/5 p-10 text-center text-slate-300">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  <i className="fas fa-search" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' }}></i>
                </div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const meta = productMeta[product.category] || productMeta.vehicle;

                return (
                  <article key={product.title} className="group relative flex min-h-[520px] flex-col overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] shadow-[0_24px_70px_rgba(0,0,0,0.36)] transition duration-300 before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_34%)] hover:-translate-y-1.5 hover:border-white/20 hover:shadow-[0_34px_90px_rgba(15,23,42,0.68)]">
                    <div className={`absolute left-0 top-0 z-[2] h-1 w-full bg-gradient-to-r ${meta.accent}`} aria-hidden="true" />

                    <div className="relative z-[2] m-3 mb-0 h-60 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="block h-full w-full object-cover transition duration-700 group-hover:scale-[1.05] group-hover:saturate-[1.08]"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,23,0.78),rgba(2,6,23,0.12)_52%,rgba(255,255,255,0.04))]" />
                      <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
                        <span className="rounded-full border border-white/15 bg-slate-950/60 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-100 backdrop-blur">
                          {meta.kicker}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] shadow-[0_10px_25px_rgba(0,0,0,0.25)] backdrop-blur ${meta.badgeClass}`}>
                          {product.badge}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="m-0 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-300">Starting from</p>
                        <p className="m-0 mt-1 text-[1.65rem] font-extrabold leading-none tracking-normal text-white drop-shadow">{product.price}</p>
                      </div>
                    </div>

                    <div className="relative z-[2] flex flex-1 flex-col p-5">
                      <div className="mb-4">
                        <h2 className="m-0 text-[1.1rem] font-extrabold leading-snug tracking-normal text-slate-50">{product.title}</h2>
                        <p className="mt-2 min-h-[70px] text-sm leading-6 text-slate-300/78">{product.description}</p>
                      </div>

                      <div className="mb-5 flex flex-wrap gap-2">
                        {meta.chips.map((chip) => (
                          <span key={chip} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1.5 text-[0.72rem] font-semibold text-slate-200">
                            <i className="fas fa-check text-[0.62rem] text-blue-300" aria-hidden="true"></i>
                            {chip}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto border-t border-white/10 pt-4">
                        <div className="flex items-center justify-between gap-3 pb-4 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-2">
                            <i className="fas fa-shield-alt text-blue-300" aria-hidden="true"></i>
                            Biltronix checked
                          </span>
                          <span className="font-semibold text-slate-200">Available</span>
                        </div>

                        <div className="grid grid-cols-[1fr_auto] gap-2.5">
                          <a
                            href="https://wa.me/2347060882711"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-[0.82rem] font-extrabold tracking-[0.03em] text-slate-950 no-underline shadow-[0_16px_34px_rgba(255,255,255,0.14)] transition hover:-translate-y-px hover:text-slate-950 hover:bg-blue-100"
                          >
                            <i className="fab fa-whatsapp text-emerald-500" aria-hidden="true"></i>
                            Inquire Now
                          </a>
                          <button className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-slate-200 transition hover:border-blue-300/40 hover:bg-blue-400/10 hover:text-blue-100" type="button" aria-label={`View details for ${product.title}`}>
                            <i className="fas fa-arrow-right" aria-hidden="true"></i>
                          </button>
                        </div>
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

      {/* ── Dark Footer ── */}
      <footer className="border-t border-white/10 bg-slate-950 py-6 text-sm text-slate-400">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>Biltronix Store · Premium Vehicles &amp; Parts</span>
            <span>© {new Date().getFullYear()} Biltronix Automotive. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
