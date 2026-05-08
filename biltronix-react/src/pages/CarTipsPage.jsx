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
    <div className="tips-dark-page">
      <SiteHeader />

      {/* ── Luxury Header Panel ── */}
      <div className="sales-header-panel">
        <div className="container mx-auto px-4 md:px-6">
          <span className="sales-header-badge">
            <span className="sales-header-pulse" aria-hidden="true" />
            Knowledge Base
          </span>

          <h1 className="sales-header-h1">
            Car Tips &amp;{' '}
            <span className="lux-gold-text">Expert Advice</span>
          </h1>

          <p className="sales-header-sub">
            Professional automotive guidance written by certified technicians —
            keep your vehicle running at its peak.
          </p>

          {/* Search + Category Filters */}
          <div className="sales-filter-row">
            <div className="sales-filters">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`sales-filter-btn${category === item ? ' active' : ''}`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="sales-search-wrap">
              <i className="fas fa-search" aria-hidden="true"></i>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tips by keyword…"
                className="sales-search"
                aria-label="Search tips"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Tips Grid ── */}
      <main>
        <div className="container mx-auto px-4 md:px-6" style={{ paddingTop: '52px', paddingBottom: '80px' }}>
          {loading ? (
            <div className="tips-loading">
              <div className="tips-loading-spinner" aria-hidden="true" />
              <p>Loading expert tips…</p>
            </div>
          ) : filteredTips.length === 0 ? (
            <div className="tips-empty">
              <div className="tips-empty-icon">
                <i className="fas fa-lightbulb" style={{ color: '#c8962a', fontSize: '1.4rem' }}></i>
              </div>
              <h3>No tips found</h3>
              <p>Try a different search term or category</p>
            </div>
          ) : (
            <div className="tips-grid">
              {filteredTips.map((tip, index) => (
                <article
                  key={`${tip.title}-${index}`}
                  className="tip-card"
                  onClick={() => setSelectedTip(tip)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedTip(tip)}
                  aria-label={`Read tip: ${tip.title}`}
                >
                  {/* Image or placeholder */}
                  {tip.imageUrl ? (
                    <div className="tip-card-img-wrap">
                      <img
                        src={tip.imageUrl}
                        alt={tip.title}
                        className="tip-card-img"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="tip-card-placeholder" aria-hidden="true">
                      <i className="fas fa-car"></i>
                    </div>
                  )}

                  {/* Body */}
                  <div className="tip-card-body">
                    <span className="tip-card-cat">{tip.category || 'General'}</span>
                    <h2 className="tip-card-title">{tip.title || 'Untitled Tip'}</h2>
                    <p className="tip-card-preview">{trimWords(tip.body || '', PREVIEW_WORD_LIMIT)}</p>
                    <div className="tip-card-read-more">
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
          className="tips-modal-overlay"
          onClick={() => setSelectedTip(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedTip.title}
        >
          <div className="tips-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="tips-modal-header">
              <span className="tip-card-cat">{selectedTip.category || 'General'}</span>
              <button
                className="tips-modal-close"
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
                className="tips-modal-img"
              />
            ) : (
              <div className="tips-modal-placeholder" aria-hidden="true">
                <i className="fas fa-car"></i>
              </div>
            )}

            <h2 className="tips-modal-title">{selectedTip.title || 'Untitled Tip'}</h2>
            <p className="tips-modal-body-text">{selectedTip.body || 'No content available.'}</p>

            <div className="tips-modal-footer">
              <button
                onClick={() => setSelectedTip(null)}
                className="vcard-btn-ghost"
                style={{ padding: '10px 24px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="tips-footer">
        <div className="container mx-auto px-4">
          <div className="tips-footer-inner">
            <span>© {new Date().getFullYear()} Biltronix Automotive. All rights reserved.</span>
            <span>Expert automotive advice, updated daily.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
