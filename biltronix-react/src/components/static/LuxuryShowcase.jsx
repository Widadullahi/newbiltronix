import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const SPEED_LINES = [
  { top: '7%',  width: '220px', delay: '0.00s', dur: '1.05s', opacity: 0.9 },
  { top: '13%', width: '110px', delay: '0.22s', dur: '0.80s', opacity: 0.6 },
  { top: '20%', width: '300px', delay: '0.08s', dur: '1.15s', opacity: 0.85 },
  { top: '27%', width: '85px',  delay: '0.38s', dur: '0.72s', opacity: 0.5 },
  { top: '34%', width: '360px', delay: '0.14s', dur: '1.25s', opacity: 0.9 },
  { top: '41%', width: '150px', delay: '0.42s', dur: '0.92s', opacity: 0.65 },
  { top: '49%', width: '260px', delay: '0.06s', dur: '1.08s', opacity: 0.8 },
  { top: '57%', width: '100px', delay: '0.30s', dur: '0.78s', opacity: 0.5 },
  { top: '65%', width: '320px', delay: '0.18s', dur: '1.18s', opacity: 0.75 },
  { top: '73%', width: '75px',  delay: '0.48s', dur: '0.88s', opacity: 0.4 },
  { top: '80%', width: '180px', delay: '0.10s', dur: '1.00s', opacity: 0.7 },
];

export default function LuxuryShowcase() {
  const sectionRef = useRef(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cls = animated ? 'lux-section lux-on' : 'lux-section';

  return (
    <section ref={sectionRef} className={cls} aria-label="Luxury vehicle showcase">
      {/* Background */}
      <div className="lux-bg" aria-hidden="true" />

      {/* Speed lines */}
      <div className="lux-lines" aria-hidden="true">
        {SPEED_LINES.map((l, i) => (
          <div
            key={i}
            className="lux-line"
            style={{
              top: l.top,
              '--lw':   l.width,
              '--ld':   l.delay,
              '--ldur': l.dur,
              '--lo':   l.opacity,
            }}
          />
        ))}
      </div>

      {/* Left text content */}
      <div className="lux-content">
        <span className="lux-tag">PREMIUM COLLECTION</span>
        <h2 className="lux-h2">
          Drive the<br />
          <span className="animate-[luxGoldShimmer_4s_linear_infinite] bg-[linear-gradient(90deg,#001F3F,#4a6fa5,#f0f4ff,#001F3F)] bg-[length:300%_auto] bg-clip-text text-transparent">Extraordinary</span>
        </h2>
        <p className="lux-p">
          World-class vehicles, certified and curated — engineered to
          deliver an unmatched driving experience.
        </p>
        <Link to="/sales" className="lux-btn">
          <i className="fas fa-arrow-right"></i>
          Explore Fleet
        </Link>

        {/* Quick stats */}
        <div className="lux-stats" aria-label="Quick stats">
          <div className="lux-stat">
            <span className="lux-stat-val">120+</span>
            <span className="lux-stat-lbl">Vehicles</span>
          </div>
          <div className="lux-stat-div" aria-hidden="true" />
          <div className="lux-stat">
            <span className="lux-stat-val">100%</span>
            <span className="lux-stat-lbl">Certified</span>
          </div>
          <div className="lux-stat-div" aria-hidden="true" />
          <div className="lux-stat">
            <span className="lux-stat-val">5★</span>
            <span className="lux-stat-lbl">Service</span>
          </div>
        </div>
      </div>

      {/* Car stage */}
      <div className="lux-stage" aria-hidden="true">
        {/* Spotlight from above */}
        <div className="lux-spotlight" />
        {/* Headlight beam cones */}
        <div className="lux-beam lux-beam-top" />
        <div className="lux-beam lux-beam-bot" />
        {/* Ground glow */}
        <div className="lux-glow" />

        {/* Slide-in wrapper */}
        <div className="lux-car-slide">
          {/* Float wrapper */}
          <div className="lux-car-float">
            <img
              src="https://images.pexels.com/photos/33345481/pexels-photo-33345481.jpeg?auto=compress&cs=tinysrgb&w=1400"
              alt="Luxury sports car"
              className="lux-car-img"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
