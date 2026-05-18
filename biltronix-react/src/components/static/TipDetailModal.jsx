import React from 'react';

export default function TipDetailModal({ modal, onClose }) {
  if (!modal.open) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tip-detail-title"
      onClick={onClose}
    >
      <div
        className="rounded-glass border border-glass-border bg-glass-surface shadow-glass backdrop-blur-glass transition hover:-translate-y-0.5 hover:bg-white/85 hover:shadow-glass-hover max-w-lg w-full p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <span className="inline-block rounded-full border border-primary-300 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary text-xs">
            {modal.category || 'General'}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {modal.imageUrl ? (
          <img
            src={modal.imageUrl}
            alt={modal.title}
            className="w-full h-56 object-cover rounded-lg mb-5 border border-slate-100"
          />
        ) : (
          <div className="w-full h-48 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-5 border border-slate-100">
            <i className="fas fa-car text-slate-300 text-4xl"></i>
          </div>
        )}

        <h3 className="text-xl font-bold text-text-primary mb-3" id="tip-detail-title">
          {modal.title}
        </h3>

        <p className="text-sm text-text-secondary leading-relaxed">
          {modal.body}
        </p>

        <div className="mt-6 pt-5 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl border border-glass-border bg-glass-surface text-text-primary backdrop-blur transition hover:bg-white/85 px-6 py-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}