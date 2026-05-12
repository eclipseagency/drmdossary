'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type Lang } from '@/lib/content'
import { CONTACT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const SERVICE_OPTIONS_AR = [
  { value: '', label: 'اختر نوع الاستشارة' },
  { value: 'استشارة طبية', label: 'استشارة طبية' },
  { value: 'عمليات تصحيح النظر', label: 'عمليات تصحيح النظر' },
  { value: 'عمليات الماء الأبيض', label: 'عمليات الماء الأبيض' },
  { value: 'علاج القرنية المخروطية', label: 'علاج القرنية المخروطية' },
  { value: 'أخرى', label: 'أخرى' },
]

const SERVICE_OPTIONS_EN = [
  { value: '', label: 'Select a consultation type' },
  { value: 'General medical consultation', label: 'General medical consultation' },
  { value: 'Vision correction surgery', label: 'Vision correction surgery' },
  { value: 'Cataract surgery', label: 'Cataract surgery' },
  { value: 'Keratoconus treatment', label: 'Keratoconus treatment' },
  { value: 'Other', label: 'Other' },
]

type FormState = {
  name: string
  city: string
  phone: string
  service: string
  notes: string
}

const EMPTY: FormState = { name: '', city: '', phone: '', service: '', notes: '' }

export function BookingForm({ lang }: { lang: Lang }) {
  const [data, setData] = useState<FormState>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const isAr = lang === 'ar'
  const options = isAr ? SERVICE_OPTIONS_AR : SERVICE_OPTIONS_EN
  const c = CONTACT[lang]

  const L = isAr
    ? {
        name: 'الاسم بالكامل',
        city: 'المدينة',
        phone: 'رقم الجوال',
        service: 'نوع الاستشارة',
        notes: 'ملاحظات إضافية',
        submit: 'إرسال الطلب',
        sending: 'جارٍ الإرسال…',
        thanks: 'تم إرسال طلبك بنجاح',
        thanksSub: 'سيتواصل معك فريقنا قريبًا لتأكيد الموعد.',
        reset: 'إرسال طلب جديد',
        whatsapp: 'إرسال عبر واتساب',
        emailSubject: 'طلب حجز موعد - عيادة د. محمد الدوسري',
        required: 'مطلوب',
      }
    : {
        name: 'Full name',
        city: 'City',
        phone: 'Mobile number',
        service: 'Consultation type',
        notes: 'Additional notes',
        submit: 'Send request',
        sending: 'Sending…',
        thanks: 'Your request has been sent',
        thanksSub: 'Our team will get back to you shortly to confirm the appointment.',
        reset: 'Send another request',
        whatsapp: 'Send via WhatsApp',
        emailSubject: 'Booking request — Dr Mohammad Al Dossary clinic',
        required: 'Required',
      }

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setData((d) => ({ ...d, [k]: v }))
  }

  function buildMessage(): string {
    const lines = isAr
      ? [
          `الاسم: ${data.name}`,
          `المدينة: ${data.city}`,
          `الجوال: ${data.phone}`,
          `نوع الاستشارة: ${data.service}`,
          data.notes ? `ملاحظات: ${data.notes}` : null,
        ]
      : [
          `Name: ${data.name}`,
          `City: ${data.city}`,
          `Phone: ${data.phone}`,
          `Consultation: ${data.service}`,
          data.notes ? `Notes: ${data.notes}` : null,
        ]
    return lines.filter(Boolean).join('\n')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Until a server-side handler is wired, the booking goes through the
    // patient's mail client. The form validates required fields client-side.
    const body = buildMessage()
    const subject = encodeURIComponent(L.emailSubject)
    const mailto = `mailto:${c.email}?subject=${subject}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
    setSubmitted(true)
  }

  function handleWhatsApp() {
    const body = buildMessage()
    const number = c.phoneTel.replace(/[^0-9]/g, '')
    const url = `https://wa.me/${number}?text=${encodeURIComponent(body)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function reset() {
    setData(EMPTY)
    setSubmitted(false)
  }

  const inputBase =
    'w-full rounded-2xl border border-surface-edge bg-white px-4 py-3.5 text-ink placeholder:text-ink-muted/70 ' +
    'focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 transition-all'

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="thanks"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 0.65, 0.32, 1] }}
          className="rounded-3xl bg-gradient-to-br from-brand-50 to-white border border-brand-300/40 p-10 text-center shadow-soft"
        >
          <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand-soft text-white shadow-glow">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </div>
          <h3 className="text-2xl md:text-3xl text-brand-900 mb-2">{L.thanks}</h3>
          <p className="text-ink-muted mb-6 m-0">{L.thanksSub}</p>
          <button type="button" onClick={reset} className="btn btn-ghost">
            {L.reset}
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white border border-surface-edge shadow-soft p-6 md:p-8"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-brand-900 mb-1.5">
                {L.name} <span className="text-brand-500">*</span>
              </label>
              <input
                type="text"
                required
                value={data.name}
                onChange={(e) => update('name', e.target.value)}
                autoComplete="name"
                className={inputBase}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-900 mb-1.5">
                {L.city} <span className="text-brand-500">*</span>
              </label>
              <input
                type="text"
                required
                value={data.city}
                onChange={(e) => update('city', e.target.value)}
                autoComplete="address-level2"
                className={inputBase}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-900 mb-1.5">
                {L.phone} <span className="text-brand-500">*</span>
              </label>
              <input
                type="tel"
                required
                inputMode="tel"
                value={data.phone}
                onChange={(e) => update('phone', e.target.value)}
                autoComplete="tel"
                className={inputBase}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-brand-900 mb-1.5">
                {L.service} <span className="text-brand-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={data.service}
                  onChange={(e) => update('service', e.target.value)}
                  className={cn(inputBase, 'appearance-none pe-12 cursor-pointer')}
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={!opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span
                  aria-hidden
                  className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-brand-500"
                >
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-brand-900 mb-1.5">{L.notes}</label>
              <textarea
                rows={4}
                value={data.notes}
                onChange={(e) => update('notes', e.target.value)}
                className={cn(inputBase, 'resize-y min-h-[120px]')}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" className="btn btn-lg btn-primary">
              {L.submit}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={isAr ? { transform: 'scaleX(-1)' } : undefined}>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleWhatsApp}
              className="btn btn-lg inline-flex items-center gap-2 bg-[#25D366] text-white shadow-[0_6px_18px_rgba(37,211,102,0.35)] hover:bg-[#1ebe5d] hover:-translate-y-0.5"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01ZM12.04 20.15h-.01a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.21 8.21 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c-.01 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.4-.12-.56.12-.16.25-.64.81-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.04 0 1.2.88 2.36 1 2.52.12.16 1.74 2.65 4.2 3.71.59.25 1.04.4 1.4.51.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.18-.48-.3Z" />
              </svg>
              {L.whatsapp}
            </button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  )
}
