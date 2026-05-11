import React from 'react';

export default function PopupOverlay({ popup, onClose }) {
  if (!popup.open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4">
      <div className="max-w-md w-full p-6 animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '16px', boxShadow: '0 24px 64px rgba(0, 0, 0, 0.1)' }}>
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