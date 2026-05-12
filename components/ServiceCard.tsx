import Link from 'next/link'
import Image from 'next/image'
import { type Lang } from '@/lib/content'

type Service = {
  href: string
  icon: string
  image: string
  name: string
  desc: string
}

/**
 * Service card with a three-state hover image reveal.
 *
 * Default — clean white card with a thin sliver of the service image
 * peeking at the bottom edge (the image is positioned absolute with
 * inset:0 and translated down 85% so only its top slice is visible at
 * the card's bottom).
 *
 * Hover — the image rises into place (translateY 0), a dark navy
 * overlay fades in on top of it, and every piece of text crossfades
 * from ink → white. The icon and "View Service" pill stay anchored at
 * the same coordinates; only their color changes.
 *
 * Transition — 550ms, cubic-bezier(0.22, 1, 0.36, 1) (ease-out-expo
 * feel) so the image lands softly. CSS-only, no JS, fully reduced-
 * motion safe (motion-reduce variants disable the slide).
 */
export function ServiceCard({
  service,
  lang,
  more,
}: {
  service: Service
  lang: Lang
  more: string
}) {
  const isAr = lang === 'ar'

  return (
    <Link
      href={service.href}
      className="
        group relative isolate flex h-full min-h-[420px] flex-col overflow-hidden
        rounded-3xl border border-surface-edge bg-white p-7 sm:p-8 shadow-soft
        transition-all duration-[900ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]
        hover:-translate-y-1 hover:shadow-lift
      "
    >
      {/* Image — starts mostly hidden below the card edge, leaving a
          thin sliver of itself visible at the very bottom of the card.
          Rises to fill the card on hover. */}
      <span className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-3xl" aria-hidden>
        <span className="block absolute inset-0 translate-y-[85%] transition-transform duration-[900ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 motion-reduce:translate-y-0 motion-reduce:opacity-0 motion-reduce:group-hover:opacity-100 motion-reduce:transition-opacity">
          <Image
            src={service.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </span>
      </span>

      {/* Dark navy overlay — fades in on hover so the text stays
          readable against the image. */}
      <span
        aria-hidden
        className="
          pointer-events-none absolute inset-0 z-[1] rounded-3xl
          bg-brand-900/60 opacity-0
          transition-opacity duration-[900ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]
          group-hover:opacity-100
        "
      />

      {/* Body — colors flip on hover, position is locked. */}
      <div
        className="
          relative z-[2] flex h-full flex-col gap-4
          transition-colors duration-[900ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]
        "
      >
        {/* Icon — stays in the same color disc, only the surrounding text changes */}
        <span
          className="
            flex h-14 w-14 items-center justify-center rounded-2xl
            bg-brand-500 shadow-glow
            transition-colors duration-[900ms]
            group-hover:bg-brand-400
          "
        >
          <Image src={service.icon} alt="" width={32} height={32} className="h-8 w-8 object-contain invert brightness-200" />
        </span>

        {/* Title */}
        <h3
          className="
            text-xl md:text-2xl leading-snug m-0
            text-brand-900 group-hover:text-white
            transition-colors duration-[900ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]
          "
        >
          {service.name}
        </h3>

        {/* Divider */}
        <span
          aria-hidden
          className="
            h-px w-12 rounded-full
            bg-surface-edge group-hover:bg-white/40
            transition-colors duration-[900ms]
          "
        />

        {/* Description */}
        <p
          className="
            m-0 text-[15px] leading-relaxed flex-grow
            text-ink-muted group-hover:text-white/85
            transition-colors duration-[900ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]
          "
        >
          {service.desc}
        </p>

        {/* CTA pill — stays at the bottom-start corner */}
        <span
          className="
            inline-flex items-center gap-2 self-start mt-2
            rounded-full border px-4 py-2 text-sm font-semibold
            border-brand-500/40 text-brand-600 bg-white/0
            group-hover:bg-white group-hover:text-brand-900 group-hover:border-white
            transition-colors duration-[900ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]
          "
        >
          <span>{more}</span>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={isAr ? { transform: 'scaleX(-1)' } : undefined}
            className="transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  )
}
