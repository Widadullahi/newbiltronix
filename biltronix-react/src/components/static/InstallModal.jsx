import React from 'react';

export default function InstallModal({ installModal, triggerInstallPrompt, onClose }) {
  if (!installModal.open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4">
      <div className="glass-card max-w-md w-full p-6 animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <i className="fas fa-mobile-alt text-primary text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">{installModal.title}</h3>
              <p className="text-sm text-text-muted">Install for a better experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed mb-6">
          {installModal.message}
        </p>

        <div className="flex gap-3">
          {installModal.canInstall && (
            <button
              type="button"
              onClick={triggerInstallPrompt}
              className="flex-1 btn-primary py-2.5"
            >
              <i className="fas fa-download mr-2"></i>
              Install Now
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-5 py-2.5"
          >
            {installModal.canInstall ? 'Maybe Later' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}