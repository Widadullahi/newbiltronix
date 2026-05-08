import React from 'react';

export default function InstallSidePrompt({ visible, onInstall, onClose }) {
  if (!visible) return null;
  
  return (
    <aside
      className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-72 glass-card p-5 animate-slide-up"
      aria-label="Install app prompt"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
        aria-label="Close"
      >
        <i className="fas fa-times text-sm"></i>
      </button>

      <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
        <i className="fas fa-mobile-alt text-primary text-xl"></i>
      </div>

      <h3 className="text-base font-semibold text-text-primary">
        Install Biltronix App
      </h3>
      <p className="text-xs text-text-secondary mt-2 leading-relaxed">
        Add to your home screen for quick access and a better experience.
      </p>

      <button
        type="button"
        onClick={onInstall}
        className="w-full btn-primary mt-4 py-2.5 text-sm"
      >
        <i className="fas fa-download mr-2"></i>
        Install Now
      </button>
    </aside>
  );
}