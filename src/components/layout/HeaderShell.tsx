'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';

type HeaderShellProps = {
  className?: string;
  children: ReactNode;
};

/** How far the page must move in one direction before the header reacts (px). */
const NUDGE = 6;
/** Near the top of the page the header always shows. */
const TOP = 96;

/**
 * The header's own element. On phones (see SiteHeader.module.css) it sticks
 * to the top, slips away as you scroll down to read, and comes back the
 * moment you scroll up. It stays out of the way while something immersive
 * (any element marked `data-immersive`, like the store tour) is behind it,
 * and never hides while you're using something inside it.
 */
export function HeaderShell({ className, children }: HeaderShellProps) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState({ hidden: false, scrolled: false });

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const header = ref.current;
      const busy = Boolean(
        header?.contains(document.activeElement) && document.activeElement !== document.body,
      );
      // Once the tour reaches the header's line it would sit on the arch, so
      // it stays away until there's room for it above the tour again.
      const line = header?.offsetHeight ?? 0;
      const immersive = [...document.querySelectorAll('[data-immersive]')].some((element) => {
        const rect = element.getBoundingClientRect();
        return rect.top < line && rect.bottom > line;
      });

      setState((current) => {
        let hidden = current.hidden;
        if (y < TOP) hidden = false;
        else if (y > lastY + NUDGE) hidden = true;
        else if (y < lastY - NUDGE) hidden = false;
        if (immersive) hidden = true;
        if (busy) hidden = false;
        const scrolled = y > 4;
        return hidden === current.hidden && scrolled === current.scrolled
          ? current
          : { hidden, scrolled };
      });
      if (Math.abs(y - lastY) > NUDGE) lastY = y;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      ref={ref}
      className={className}
      data-hidden={state.hidden}
      data-scrolled={state.scrolled}
    >
      {children}
    </header>
  );
}
