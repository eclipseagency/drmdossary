'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type TiltProps = {
  children: ReactNode
  className?: string
  max?: number
  glare?: boolean
  isRTL?: boolean
  style?: CSSProperties
}

/**
 * Pointer-driven 3D tilt wrapper using framer-motion springs.
 * Glare overlay tracks the cursor via CSS variables.
 * Disabled on coarse pointers / reduced motion.
 */
export function TiltCard({
  children,
  className,
  max = 8,
  glare = true,
  isRTL = false,
  style,
}: TiltProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const fine =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setEnabled(fine && !reduced)
  }, [])

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [0, 1], [max, -max]), {
    stiffness: 220,
    damping: 22,
    mass: 0.5,
  })
  const ryRaw = useTransform(mx, [0, 1], [-max, max])
  const ry = useSpring(useTransform(ryRaw, (v) => (isRTL ? -v : v)), {
    stiffness: 220,
    damping: 22,
    mass: 0.5,
  })
  const glareX = useTransform(mx, (v) => `${v * 100}%`)
  const glareY = useTransform(my, (v) => `${v * 100}%`)

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!enabled || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }
  function handleLeave() {
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      className={cn('relative', className)}
      style={
        enabled
          ? {
              ...style,
              rotateX: rx,
              rotateY: ry,
              transformStyle: 'preserve-3d',
              transformPerspective: 1200,
              willChange: 'transform',
            }
          : style
      }
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
      {enabled && glare && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 mix-blend-screen transition-opacity duration-200 group-hover:opacity-100 hover:opacity-100"
          style={{
            background: `radial-gradient(circle at var(--glare-x) var(--glare-y), rgba(255,255,255,.30), rgba(255,255,255,0) 40%)`,
            // @ts-expect-error css vars
            '--glare-x': glareX,
            '--glare-y': glareY,
          }}
        />
      )}
    </motion.div>
  )
}
