import React from 'react';

export default function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/2347060882711"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-2xl text-white shadow-[0_14px_34px_rgba(37,211,102,0.34)] transition hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(37,211,102,0.45)]"
      aria-label="Chat on WhatsApp"
    >
      <i className="fab fa-whatsapp" aria-hidden="true"></i>
    </a>
  );
}
