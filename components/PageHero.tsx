'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { type ReactNode } from 'react'
import { Reveal } from './Reveal'
import { TextReveal } from './TextReveal'

export function PageHero({
  eyebrow,
  title,
  lede,
  image,
  imageAlt = '',
  children,
}: {
  eyebrow?: string
  title: string
  lede?: string
  image?: string
  imageAlt?: string
  children?: ReactNode
}) {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-brand text-white">
      {/* Soft floating shapes */}
      <span
        aria-hidden
        className="absolute -top-32 end-[-100px] h-[360px] w-[360px] rounded-full bg-brand-500/40 blur-3xl animate-float-a respect-motion"
      />
      <span
        aria-hidden
        className="absolute -bottom-32 start-[-80px] h-[320px] w-[320px] rounded-full bg-brand-400/30 blur-3xl animate-float-b respect-motion"
      />
      <span aria-hidden className="absolute inset-0 bg-noise opacity-[0.04] pointer-events-none" />

      <div className="container relative py-16 md:py-24">
        <div className={image ? 'grid md:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-12 items-center' : ''}>
          <div>
            {eyebrow && (
              <Reveal>
                <p className="inline-block px-3 py-1 rounded-full bg-white/15 text-white text-xs sm:text-sm font-semibold mb-4 backdrop-blur">
                  {eyebrow}
                </p>
              </Reveal>
            )}
            <h1 className="text-3xl md:text-5xl text-white leading-tight">
              <TextReveal text={title} className="grad-text-light" delay={120} step={55} />
            </h1>
            {lede && (
              <p className="mt-5 text-white/85 text-base md:text-lg max-w-2xl">
                <TextReveal text={lede} delay={500} step={22} offset={10} />
              </p>
            )}
            {children && (
              <Reveal delay={240}>
                <div className="mt-7 flex flex-wrap gap-3">{children}</div>
              </Reveal>
            )}
          </div>
          {image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 0.65, 0.32, 1], delay: 0.1 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-lift ring-1 ring-white/15">
                <Image
                  src={image}
                  alt={imageAlt}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover max-h-[400px]"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
