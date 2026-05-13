'use client'

import { type Lang } from '@/lib/content'
import { CONTACT } from '@/lib/i18n'
import { Reveal } from './Reveal'

const Icons = {
  pin: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
}

export function ContactCards({ lang }: { lang: Lang }) {
  const c = CONTACT[lang]
  const cards = [
    {
      icon: Icons.pin,
      label: c.addressLabel,
      value: <span className="text-ink">{c.address}</span>,
    },
    {
      icon: Icons.phone,
      label: c.phoneLabel,
      value: (
        <a
          href={`tel:${c.phoneTel}`}
          className="text-brand-900 font-bold hover:text-brand-500 transition-colors"
        >
          <bdi>{c.phoneDisplay}</bdi>
        </a>
      ),
    },
    {
      icon: Icons.mail,
      label: c.emailLabel,
      value: (
        <a href={`mailto:${c.email}`} className="text-brand-900 font-bold hover:text-brand-500 transition-colors break-all">
          {c.email}
        </a>
      ),
    },
    {
      icon: Icons.clock,
      label: c.hoursLabel,
      value: <span className="text-ink">{c.hours}</span>,
    },
  ]

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, i) => (
        <Reveal key={card.label} delay={i * 100}>
          <div className="h-full p-6 rounded-2xl bg-white border border-surface-edge text-center hover:shadow-lift hover:-translate-y-1 hover:border-brand-400/40 transition-all duration-300">
            <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand-soft text-white shadow-glow">
              {card.icon}
            </span>
            <h3 className="text-base font-bold text-brand-900 mb-1.5">{card.label}</h3>
            <p className="m-0 text-[15px]">{card.value}</p>
          </div>
        </Reveal>
      ))}
    </div>
  )
}
