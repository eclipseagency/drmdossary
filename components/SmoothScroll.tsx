'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Silky document smooth-scroll using Lenis.
 *
 * - Wheel/touch input is intercepted and the scroll position is
 *   interpolated each rAF with a soft ease, giving the long-decay
 *   "premium template" feel.
 * - Touch devices keep native momentum so iOS / Android don't fight
 *   the OS rubber-band; only the desktop wheel is hijacked.
 * - Honours prefers-reduced-motion — when set, the component bails out
 *   and the browser's native scroll is used as-is.
 * - Container scrolls (the testimonials carousel uses overflow-x-auto)
 *   are unaffected because Lenis only animates the document scroll.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const lenis = new Lenis({
      duration: 1.25,
      // Strong ease-out so the deceleration is long and smooth — same
      // family of curve as the Visen template referenced by the user.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch: leave native momentum alone — Lenis 1.x default is false
      // for touch which is what we want.
      wheelMultiplier: 1,
      lerp: 0.1,
    })

    let rafId = 0
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return null
}
