import React from 'react';

export default function StoreDetailModal({ productModal, onClose, onPrev, onNext }) {
  if (!productModal.open) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-detail-title"
      onClick={onClose}
    >
      <div
        className="glass-card max-w-4xl w-full p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Close"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-video rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden">
              {productModal.images.length > 0 ? (
                <img
                  src={productModal.images[productModal.index]}
                  alt={productModal.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <i className="fas fa-image text-slate-300 text-5xl"></i>
              )}
            </div>

            {productModal.images.length > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={onPrev}
                  className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-text-secondary hover:bg-slate-200 transition-colors"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <span className="text-sm font-medium text-text-secondary">
                  {productModal.index + 1} / {productModal.images.length}
                </span>
                <button
                  onClick={onNext}
                  className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-text-secondary hover:bg-slate-200 transition-colors"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="space-y-4">
            <span className="badge-primary text-xs inline-block">
              {productModal.category || 'Product'}
            </span>

            <h3 className="text-xl font-bold text-text-primary" id="store-detail-title">
              {productModal.title}
            </h3>

            <p className="text-sm text-text-secondary leading-relaxed">
              {productModal.description}
            </p>

            <p className="text-2xl font-bold text-primary">
              {productModal.price}
            </p>

            <div className="pt-4 border-t border-slate-100">
              <ul className="space-y-2">
                {[
                  'Quality verified by Biltronix',
                  'Fast delivery available',
                  'Expert support included'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                    <i className="fas fa-check-circle text-success"></i>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <a
                href="https://wa.me/2347060882711"
                target="_blank"
                rel="noreferrer"
                className="flex-1 btn-primary py-2.5 text-center"
              >
                <i className="fab fa-whatsapp mr-2"></i>
                Inquire Now
              </a>
              <button className="btn-secondary px-5 py-2.5">
                <i className="fas fa-bookmark"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}