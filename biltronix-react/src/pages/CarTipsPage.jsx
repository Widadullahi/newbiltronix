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
    <div className="min-h-screen bg-[#030712] text-white">
      <SiteHeader />

      {/* ── Luxury Header Panel ── */}
      <div className="relative overflow-hidden border-b border-blue-300/10 bg-gradient-to-br from-slate-950 via-[#071225] to-[#020617] px-0 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-300" aria-hidden="true" />
            Knowledge Base
          </span>

          <h1 className="m-0 max-w-3xl font-heading text-[clamp(2.3rem,5vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-white">
            Car Tips &amp;{' '}
            <span className="animate-[luxGoldShimmer_4s_linear_infinite] bg-[linear-gradient(90deg,#60a5fa,#93c5fd,#ffffff,#bfdbfe,#60a5fa)] bg-[length:300%_auto] bg-clip-text text-transparent">Expert Advice</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300/80">
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
                  className={`rounded-md border border-white/10 px-4 py-2 text-sm font-bold transition ${category === item ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'}`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex min-w-[260px] items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-slate-300">
              <i className="fas fa-search" aria-hidden="true"></i>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tips by keyword…"
                className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
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
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 text-slate-300">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-300/20 border-t-blue-300" aria-hidden="true" />
              <p>Loading expert tips…</p>
            </div>
          ) : filteredTips.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-10 text-center text-slate-300">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                <i className="fas fa-lightbulb" style={{ color: '#c8962a', fontSize: '1.4rem' }}></i>
              </div>
              <h3>No tips found</h3>
              <p>Try a different search term or category</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTips.map((tip, index) => (
                <article
                  key={`${tip.title}-${index}`}
                  className="group cursor-pointer overflow-hidden rounded-lg border border-slate-400/20 bg-gradient-to-b from-slate-900 to-[#030a18] shadow-[0_22px_58px_rgba(2,6,23,0.36)] transition hover:-translate-y-1 hover:border-blue-400/30"
                  onClick={() => setSelectedTip(tip)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedTip(tip)}
                  aria-label={`Read tip: ${tip.title}`}
                >
                  {/* Image or placeholder */}
                  {tip.imageUrl ? (
                    <div className="h-52 overflow-hidden bg-slate-950">
                      <img
                        src={tip.imageUrl}
                        alt={tip.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-slate-900 text-5xl text-slate-700" aria-hidden="true">
                      <i className="fas fa-car"></i>
                    </div>
                  )}

                  {/* Body */}
                  <div className="p-5">
                    <span className="inline-flex rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-200">{tip.category || 'General'}</span>
                    <h2 className="mt-3 text-xl font-bold text-white">{tip.title || 'Untitled Tip'}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300/75">{trimWords(tip.body || '', PREVIEW_WORD_LIMIT)}</p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-300">
                      Read Full Tip
                      <i className="fas fa-arrow-right" style={{ fontSize: '0.7rem' }} aria-hidden="true"></i>
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
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/10 bg-slate-950 p-6 shadow-glass-xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-200">{selectedTip.category || 'General'}</span>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
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
                className="mb-5 h-72 w-full rounded-lg object-cover"
              />
            ) : (
              <div className="mb-5 flex h-56 items-center justify-center rounded-lg bg-slate-900 text-5xl text-slate-700" aria-hidden="true">
                <i className="fas fa-car"></i>
              </div>
            )}

            <h2 className="text-2xl font-bold text-white">{selectedTip.title || 'Untitled Tip'}</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300">{selectedTip.body || 'No content available.'}</p>

            <div className="mt-6 flex justify-end border-t border-white/10 pt-5">
              <button
                onClick={() => setSelectedTip(null)}
                className="inline-flex items-center justify-center rounded-md border border-white/10 bg-transparent px-6 py-2.5 text-sm font-semibold text-white/70 transition hover:border-blue-400/40 hover:text-blue-200"
                style={{ padding: '10px 24px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 bg-slate-950 py-6 text-sm text-slate-400">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>© {new Date().getFullYear()} Biltronix Automotive. All rights reserved.</span>
            <span>Expert automotive advice, updated daily.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
