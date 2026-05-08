import React from 'react';

export default function InstallSidePrompt({ visible, onInstall, onClose }) {
  if (!visible) return null;
  return (
    <aside
      className="fixed right-4 top-1/2 z-50 w-full max-w-[320px] -translate-y-1/2 rounded-[16px] bg-gradient-to-br from-brand-900 via-brand-700 to-brand-accent text-white shadow-[0_24px_42px_rgba(18,35,63,0.16)] border border-white/40 p-4 pt-5 sm:top-auto sm:bottom-20 sm:translate-y-0"
      aria-label="Install app prompt"
    >
      <button
        type="button"
        className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/20 text-lg text-white transition hover:border-white"
        onClick={onClose}
        aria-label="Close install prompt"
      >
        <i className="fas fa-times" />
      </button>
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[12px] bg-white/20 text-xl">
        <i className="fas fa-mobile-screen-button" />
      </div>
      <h3 className="text-base font-head">Install Biltronix App</h3>
      <p className="text-xs leading-relaxed text-white/90">
        Add this site to your phone or desktop for faster access.
      </p>
      <button
        type="button"
        className="mt-3 w-full rounded-[10px] bg-white px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-brand-900 transition hover:bg-brand-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        onClick={onInstall}
      >
        Install Now
      </button>
    </aside>
  );
}
