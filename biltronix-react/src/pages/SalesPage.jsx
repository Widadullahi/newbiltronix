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
              filteredProducts.map((product) => (
                <article key={product.title} className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-400/20 bg-gradient-to-b from-slate-900 to-[#030a18] shadow-[0_22px_58px_rgba(2,6,23,0.36)] transition duration-300 hover:-translate-y-2 hover:border-blue-400/30 hover:shadow-[0_34px_80px_rgba(2,6,23,0.5)]">
                  {/* Image */}
                  <div className="relative h-56 shrink-0 overflow-hidden bg-slate-950 after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[120px] after:bg-[linear-gradient(to_bottom,transparent_0%,rgba(2,6,23,0.2)_45%,#071225_100%)]">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="block h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                    <span className={`absolute right-3.5 top-3.5 z-[2] rounded border px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] backdrop-blur ${product.category === 'vehicle' ? 'border-blue-300/40 bg-blue-600/80 text-white' : product.category === 'part' ? 'border-green-300/40 bg-green-600/80 text-white' : 'border-violet-300/40 bg-violet-600/80 text-white'}`}>
                      {product.badge}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col px-[22px] pb-[22px]">
                    <h2 className="m-0 mb-1.5 text-[1.08rem] font-bold tracking-[-0.01em] text-slate-50">{product.title}</h2>
                    <p className="m-0 mb-4 text-[1.45rem] font-extrabold tracking-[-0.02em] text-blue-200">{product.price}</p>
                    <div className="mb-3.5 h-px bg-gradient-to-r from-blue-400/30 to-white/5" />
                    <p className="mb-5 text-sm leading-relaxed text-slate-300/70">{product.description}</p>

                    <div className="mt-auto flex gap-2.5">
                      <a
                        href="https://wa.me/2347060882711"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-[7px] rounded-md bg-gradient-to-br from-blue-700 to-blue-500 px-4 py-[11px] text-[0.82rem] font-bold tracking-[0.03em] text-white no-underline shadow-[0_12px_30px_rgba(37,99,235,0.3)] transition hover:-translate-y-px hover:text-white hover:brightness-110"
                      >
                        <i className="fab fa-whatsapp" aria-hidden="true"></i>
                        Inquire Now
                      </a>
                      <button className="inline-flex items-center justify-center gap-1.5 rounded-md border border-white/10 bg-transparent px-4 py-[11px] text-[0.82rem] font-semibold text-white/55 transition hover:border-blue-400/40 hover:text-blue-200">
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
