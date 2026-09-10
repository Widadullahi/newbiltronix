import React, { useEffect, useMemo, useState } from 'react';
import SiteHeader from '../components/layout/SiteHeader.jsx';
import FloatingWhatsApp from '../components/static/FloatingWhatsApp.jsx';
import { fetchCarTips } from '../lib/sanityClient.js';

const PREVIEW_WORD_LIMIT = 28;

const FALLBACK_CAR_TIPS = [
  {
    title: 'Check Tire Pressure Weekly',
    body: 'Maintain proper tire inflation for optimal fuel efficiency, tire longevity, and safe handling. Check when tires are cold for accurate readings.',
    category: 'Maintenance',
  },
  {
    title: 'Listen for Brake Warning Signs',
    body: 'Squealing, grinding, or pulsating brakes indicate worn pads or rotors. Address early to prevent costly damage and ensure safety.',
    category: 'Safety',
  },
  {
    title: 'Use Quality Oil Filters',
    body: 'Premium filters protect your engine from contaminants, especially during long drives or heavy traffic conditions. Replace at every oil change.',
    category: 'Engine Care',
  },
  {
    title: 'Warm Up Smartly',
    body: 'Modern engines need minimal warm-up. Drive gently for the first few minutes rather than idling, which wastes fuel and creates deposits.',
    category: 'Engine Care',
  },
  {
    title: 'Rotate Tires Regularly',
    body: 'Rotate tires every 8,000–10,000 km to ensure even wear and extend tire life, especially important on roads with varying conditions.',
    category: 'Maintenance',
  },
  {
    title: 'Choose Quality Fuel',
    body: 'Consistent use of clean, quality fuel maintains injector performance and prevents carbon buildup for smoother engine operation.',
    category: 'Performance',
  },
];

function trimWords(input, limit = PREVIEW_WORD_LIMIT) {
  const words = String(input || '').trim().split(/\s+/).filter(Boolean);
  if (words.length <= limit) return String(input || '').trim();
  return `${words.slice(0, limit).join(' ')}…`;
}

export default function CarTipsPage() {
  const [tips, setTips] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedTip, setSelectedTip] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const remoteTips = await fetchCarTips(120);
        if (!active) return;
        setTips(Array.isArray(remoteTips) && remoteTips.length > 0 ? remoteTips : FALLBACK_CAR_TIPS);
      } catch {
        if (!active) return;
        setTips(FALLBACK_CAR_TIPS);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(tips.map((tip) => String(tip.category || 'General').trim()).filter(Boolean)))],
    [tips]
  );

  const filteredTips = useMemo(() => {
    const nq = query.trim().toLowerCase();
    return tips.filter((tip) => {
      const catMatch = category === 'All' || (tip.category || 'General') === category;
      const qMatch =
        !nq ||
        String(tip.title || '').toLowerCase().includes(nq) ||
        String(tip.body || '').toLowerCase().includes(nq) ||
        String(tip.category || '').toLowerCase().includes(nq);
      return catMatch && qMatch;
    });
  }, [category, query, tips]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <SiteHeader />

      {/* ── Knowledge Base Header ── */}
      <div className="relative overflow-hidden border-b border-slate-200 bg-cover bg-center px-0 py-16" style={{ backgroundImage: "url('/new_design/background2.png')" }}>
        <div className="pointer-events-none absolute inset-0 bg-primary/30" aria-hidden="true" />
        <div className="relative container mx-auto px-4 md:px-6">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-100 backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" aria-hidden="true" />
            Knowledge Base
          </span>

          <h1 className="m-0 max-w-3xl font-heading text-[clamp(2.3rem,5vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-white">
            Car Tips &amp;{' '}
            <span className="animate-[luxGoldShimmer_4s_linear_infinite] bg-[linear-gradient(90deg,#001F3F,#4a6fa5,#f0f4ff,#001F3F)] bg-[length:300%_auto] bg-clip-text text-transparent">Expert Advice</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200/85">
            Professional automotive guidance written by certified technicians —
            keep your vehicle running at its peak.
          </p>

          {/* Search + Category Filters */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-lg border px-4 py-2 text-sm font-bold transition ${category === item ? 'border-primary bg-primary text-white shadow-[0_6px_18px_rgba(10,31,77,0.24)]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-gray-900'}`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex min-w-[260px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <i className="fas fa-search text-slate-400" aria-hidden="true"></i>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tips by keyword…"
                className="w-full border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-slate-400"
                aria-label="Search tips"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Tips Grid ── */}
      <main>
        <div className="container mx-auto px-4 pb-20 pt-[52px] md:px-6">
          {loading ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 text-slate-500">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-primary" aria-hidden="true" />
              <p>Loading expert tips…</p>
            </div>
          ) : filteredTips.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <i className="fas fa-lightbulb text-amber-500" aria-hidden="true"></i>
              </div>
              <h3 className="mb-1 text-base font-semibold text-gray-900">No tips found</h3>
              <p>Try a different search term or category</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTips.map((tip, index) => (
                <article
                  key={`${tip.title}-${index}`}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                  onClick={() => setSelectedTip(tip)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedTip(tip)}
                  aria-label={`Read tip: ${tip.title}`}
                >
                  {/* Image or placeholder */}
                  <div className="relative">
                    {tip.imageUrl ? (
                      <img
                        src={tip.imageUrl}
                        alt={tip.title}
                        className="h-48 w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center bg-slate-50 text-5xl text-slate-200" aria-hidden="true">
                        <i className="fas fa-car"></i>
                      </div>
                    )}

                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 backdrop-blur">
                      {tip.category || 'General'}
                    </span>

                    <button
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur transition hover:bg-white"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Save tip: ${tip.title}`}
                    >
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

                  {/* Body */}
                  <div className="p-4">
                    <span className="mb-2 inline-flex rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-500">{tip.category || 'General'}</span>
                    <h2 className="mb-2 text-[15px] font-semibold leading-snug text-gray-900">{tip.title || 'Untitled Tip'}</h2>
                    <p className="text-sm leading-relaxed text-gray-500">{trimWords(tip.body || '', PREVIEW_WORD_LIMIT)}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Read Full Tip
                      <i className="fas fa-arrow-right text-xs" aria-hidden="true"></i>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <FloatingWhatsApp />

      {/* ── Tip Detail Modal ── */}
      {selectedTip && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur"
          onClick={() => setSelectedTip(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedTip.title}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-500">{selectedTip.category || 'General'}</span>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-gray-500 transition hover:bg-slate-50 hover:text-gray-900"
                onClick={() => setSelectedTip(null)}
                aria-label="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Image */}
            {selectedTip.imageUrl ? (
              <img
                src={selectedTip.imageUrl}
                alt={selectedTip.title}
                className="mb-5 h-64 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="mb-5 flex h-48 items-center justify-center rounded-xl bg-slate-50 text-5xl text-slate-200" aria-hidden="true">
                <i className="fas fa-car"></i>
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-900">{selectedTip.title || 'Untitled Tip'}</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{selectedTip.body || 'No content available.'}</p>

            <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
              <button
                onClick={() => setSelectedTip(null)}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-gray-900"
                style={{ padding: '10px 24px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-6 text-sm text-slate-500">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>© {new Date().getFullYear()} Biltronix Automobile. All rights reserved.</span>
            <span>Expert automotive advice, updated daily.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
