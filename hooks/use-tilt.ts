'use client';

import { useEffect, useRef } from 'react';

type TiltOptions = {
  /** Maximum rotation in degrees. Keep this small (≤3) so content stays readable. */
  max?: number;
  /** Perspective distance in px. */
  perspective?: number;
};

/**
 * Pointer-tracked 3D tilt. Writes straight to `element.style.transform`
 * inside a rAF callback, so there are no re-renders. Add
 * `transition-transform duration-500` to the element for a soft follow.
 *
 * Disabled automatically for coarse pointers and reduced-motion users.
 */
export function useTilt<T extends HTMLElement>({ max = 2.5, perspective = 1400 }: TiltOptions = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!canHover.matches || reducedMotion.matches) return;

    let frame = 0;

    const apply = (x: number, y: number) => {
      el.style.transform = `perspective(${perspective}px) rotateX(${x.toFixed(2)}deg) rotateY(${y.toFixed(2)}deg)`;
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => apply(-py * max, px * max));
    };

    const onPointerLeave = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => apply(0, 0));
    };

    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerleave', onPointerLeave);

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [max, perspective]);

  return ref;
}
