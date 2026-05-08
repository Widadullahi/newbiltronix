import React from 'react';

export default function PopupOverlay({ popup, onClose }) {
  if (!popup.open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="glass-card max-w-md w-full p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
            <i className="fas fa-info-circle text-primary"></i>
          </div>
          <h3 className="text-lg font-semibold text-text-primary" id="site-popup-title">
            {popup.title}
          </h3>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed mb-6">
          {popup.message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full btn-primary py-2.5"
        >
          Got it
        </button>
      </div>
    </div>
  );
}