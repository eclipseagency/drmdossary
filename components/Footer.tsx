import Link from 'next/link'
import Image from 'next/image'
import { type Lang } from '@/lib/content'
import { NAV_AR, NAV_EN, T, CONTACT } from '@/lib/i18n'

const LOGO_LIGHT = '/uploads/2024/02/logo-f.svg'

export function Footer({ lang }: { lang: Lang }) {
  const t = T[lang]
  const nav = lang === 'ar' ? NAV_AR : NAV_EN
  const c = CONTACT[lang]
  const tagline =
    lang === 'ar'
      ? 'رعاية شاملة لطب وجراحة العيون تستند إلى أحدث الأبحاث والتقنيات.'
      : 'Comprehensive ophthalmology care grounded in the latest research and technology.'
  const quickLinks = lang === 'ar' ? 'روابط سريعة' : 'Quick links'
  const contactLabel = lang === 'ar' ? 'تواصل معنا' : 'Contact'

  return (
    <footer className="relative bg-brand-900 text-white/85 overflow-hidden">
      {/* Curved divider */}
      <div className="absolute inset-x-0 top-0 -translate-y-px pointer-events-none">
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="block w-full h-[60px] sm:h-[80px]"
          aria-hidden="true"
        >
          <path
            d="M0 80 C 240 20, 480 20, 720 40 C 960 60, 1200 60, 1440 20 L 1440 0 L 0 0 Z"
            fill="rgb(247 249 251)"
          />
        </svg>
      </div>

      {/* Subtle dot pattern */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="container relative pt-24 pb-10">
        <div className="grid gap-10 md:gap-12 md:grid-cols-[1.4fr_1fr_1.2fr]">
          <div>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 p-2">
              <Image src={LOGO_LIGHT} alt="" width={56} height={56} className="h-full w-full object-contain" />
            </div>
            <h3 className="text-white text-lg font-bold mb-2">{t.brandName}</h3>
            <p className="text-white/70 leading-relaxed text-[15px]">{tagline}</p>
          </div>

          <div>
            <h4 className="text-white text-base font-bold mb-3.5">{quickLinks}</h4>
            <ul className="space-y-2.5 text-[15px]">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/85 hover:text-brand-300 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-base font-bold mb-3.5">{contactLabel}</h4>
            <ul className="space-y-3 text-[15px]">
              <li className="flex flex-col gap-0.5">
                <span className="uppercase text-2xs tracking-wider text-white/55">
                  {c.addressLabel}
                </span>
                <span>{c.address}</span>
              </li>
              <li className="flex flex-col gap-0.5">
                <span className="uppercase text-2xs tracking-wider text-white/55">
                  {c.phoneLabel}
                </span>
                <a href={`tel:${c.phoneTel}`} className="text-white hover:text-brand-300 transition-colors">
                  {c.phoneDisplay}
                </a>
              </li>
              <li className="flex flex-col gap-0.5">
                <span className="uppercase text-2xs tracking-wider text-white/55">
                  {c.emailLabel}
                </span>
                <a href={`mailto:${c.email}`} className="text-white hover:text-brand-300 transition-colors">
                  {c.email}
                </a>
              </li>
              <li className="flex flex-col gap-0.5">
                <span className="uppercase text-2xs tracking-wider text-white/55">
                  {c.hoursLabel}
                </span>
                <span>{c.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 justify-between text-white/65 text-sm">
          <p className="m-0">
            © <YearTag /> {t.brandName} — {t.rights}.
          </p>
          <p className="m-0">
            <Link href="/privacy-policy/" className="text-white/85 hover:text-brand-300 transition-colors">
              {t.privacy}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

function YearTag() {
  // Rendered server-side so it works without JS.
  return <span>{new Date().getFullYear()}</span>
}
