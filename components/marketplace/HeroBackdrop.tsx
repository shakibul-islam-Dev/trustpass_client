'use client';

import { useEffect, useRef } from 'react';

/**
 * Decorative hero backdrop: a faint grid, two drifting aurora blobs, floating
 * motes and a cursor-following spotlight.
 *
 * The only JavaScript is a rAF lerp that writes three CSS custom properties —
 * every visible animation itself is pure CSS, so it stays on the compositor.
 * Mount it inside a `relative isolate` section as the first child.
 */
const PARTICLES = [
  { pos: 'left-[7%] top-[24%] h-1.5 w-1.5', anim: 'animate-floaty-a' },
  { pos: 'left-[19%] bottom-[22%] h-1 w-1', anim: 'animate-floaty-b' },
  { pos: 'left-[33%] top-[12%] h-1 w-1', anim: 'animate-floaty-c' },
  { pos: 'right-[27%] top-[30%] h-1.5 w-1.5', anim: 'animate-floaty-b' },
  { pos: 'right-[11%] bottom-[28%] h-1 w-1', anim: 'animate-floaty-c' },
  { pos: 'right-[37%] bottom-[14%] h-1 w-1', anim: 'animate-floaty-a' },
];

export default function HeroBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reducedMotion.matches) return;

    let pointerX = 0;
    let pointerY = 0;
    let x = 0;
    let y = 0;
    let glow = 0;
    let initialized = false;
    let running = false;
    let frame = 0;

    const tick = () => {
      const rect = el.getBoundingClientRect();
      const localX = pointerX - rect.left;
      const localY = pointerY - rect.top;
      const inside = localX >= 0 && localY >= 0 && localX <= rect.width && localY <= rect.height;
      const targetX = Math.min(Math.max(localX, 0), rect.width);
      const targetY = Math.min(Math.max(localY, 0), rect.height);
      const targetGlow = inside ? 1 : 0;

      // Ease toward the pointer so the light trails smoothly instead of snapping.
      x += (targetX - x) * 0.14;
      y += (targetY - y) * 0.14;
      glow += (targetGlow - glow) * 0.12;

      el.style.setProperty('--spot-x', `${x.toFixed(1)}px`);
      el.style.setProperty('--spot-y', `${y.toFixed(1)}px`);
      el.style.setProperty('--spot', glow.toFixed(3));

      const settled =
        Math.abs(targetX - x) < 0.4 &&
        Math.abs(targetY - y) < 0.4 &&
        Math.abs(targetGlow - glow) < 0.004;

      if (settled) {
        running = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!running) {
        running = true;
        frame = requestAnimationFrame(tick);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!initialized) {
        const rect = el.getBoundingClientRect();
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
        initialized = true;
      }
      pointerX = event.clientX;
      pointerY = event.clientY;
      start();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{ '--spot': 0 } as React.CSSProperties}
    >
      {/* Fading grid — gives the hero depth without stealing focus */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[44px_44px] opacity-50 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_30%,black,transparent)]" />

      {/* Aurora blobs */}
      <div className="absolute -left-24 -top-28 h-[24rem] w-[24rem] animate-drift rounded-full bg-primary/25 blur-[100px] motion-reduce:animate-none" />
      <div className="absolute -right-20 top-8 h-[28rem] w-[28rem] animate-drift-alt rounded-full bg-sky-500/20 blur-[110px] motion-reduce:animate-none" />
      <div className="absolute bottom-[-6rem] left-1/3 h-64 w-64 animate-drift rounded-full bg-indigo-400/15 blur-[90px] motion-reduce:animate-none" />

      {/* Cursor spotlight — position and opacity are driven by the rAF lerp */}
      <div className="absolute inset-0 bg-[radial-gradient(460px_circle_at_var(--spot-x,-500px)_var(--spot-y,-500px),color-mix(in_oklab,var(--primary)_18%,transparent),transparent_72%)] opacity-[var(--spot,0)] transition-opacity duration-500" />

      {/* Floating motes */}
      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          className={`absolute rounded-full bg-primary/60 shadow-[0_0_10px_var(--primary)] ${particle.pos} ${particle.anim} motion-reduce:animate-none`}
        />
      ))}
    </div>
  );
}
