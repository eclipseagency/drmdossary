import type { Lang } from './content'

export const NAV_AR: Array<{ href: string; label: string }> = [
  { href: '/', label: 'الرئيسية' },
  { href: '/about-us/', label: 'من نحن' },
  { href: '/services/', label: 'الخدمات' },
  { href: '/blog/', label: 'المقالات' },
  { href: '/faqs/', label: 'الأسئلة الشائعة' },
  { href: '/book/', label: 'احجز معنا' },
]

export const NAV_EN: Array<{ href: string; label: string }> = [
  { href: '/en/', label: 'Home' },
  { href: '/en/about-us/', label: 'About' },
  { href: '/en/services/', label: 'Services' },
  { href: '/en/blog/', label: 'Blog' },
  { href: '/en/faq/', label: 'FAQ' },
  { href: '/en/book/', label: 'Book' },
]

export const T = {
  ar: {
    book: 'احجز موعد',
    bookNow: 'احجز موعدك',
    bookCta: 'احجز موعدك الآن',
    learnMore: 'اعرف المزيد',
    contactUs: 'تواصل معنا',
    backToBlog: 'كل المقالات',
    home: 'الرئيسية',
    privacy: 'سياسة الخصوصية',
    minRead: (n: number) => `${n} دقائق قراءة`,
    rights: 'جميع الحقوق محفوظة',
    brandName: 'د. محمد الدوسري',
    brandTitle: 'استشاري طب وجراحة العيون',
    langSwitch: 'English',
  },
  en: {
    book: 'Book',
    bookNow: 'Book an appointment',
    bookCta: 'Book your consultation',
    learnMore: 'Learn more',
    contactUs: 'Contact us',
    backToBlog: 'All articles',
    home: 'Home',
    privacy: 'Privacy Policy',
    minRead: (n: number) => `${n} min read`,
    rights: 'All rights reserved',
    brandName: 'Dr Mohammad Al Dossary',
    brandTitle: 'Consultant Ophthalmologist',
    langSwitch: 'العربية',
  },
} as const

export function langFromPath(pathname: string): Lang {
  return pathname.startsWith('/en') ? 'en' : 'ar'
}

export function dirFor(lang: Lang) {
  return lang === 'ar' ? 'rtl' : 'ltr'
}

/**
 * Map a few slugs that differ between languages. Anything not in here is
 * assumed to share the same path under both /ar/ and /en/.
 */
const SLUG_PAIRS: Array<[string, string]> = [
  // [arabic-slug, english-slug]
  ['/faqs/', '/en/faq/'],
]

/**
 * Return the equivalent URL in the other language for the given pathname.
 * E.g. `/about-us/` → `/en/about-us/`, `/en/services/` → `/services/`.
 * Pages without a known counterpart fall back to the other language's home.
 */
export function switchLanguageUrl(pathname: string): string {
  // Normalise: ensure leading slash, no query/hash.
  if (!pathname.startsWith('/')) pathname = '/' + pathname
  const cur = langFromPath(pathname)

  // Special slug mappings first
  for (const [ar, en] of SLUG_PAIRS) {
    if (cur === 'ar' && pathname === ar) return en
    if (cur === 'en' && pathname === en) return ar
  }

  if (cur === 'en') {
    // /en/<rest> → /<rest>
    const rest = pathname.replace(/^\/en(\/|$)/, '/')
    return rest === '/' ? '/' : rest
  }
  // ar → en: prepend /en
  if (pathname === '/') return '/en/'
  return '/en' + pathname
}

export const CONTACT = {
  ar: {
    address: 'الرياض، المملكة العربية السعودية',
    addressLabel: 'العنوان',
    phoneLabel: 'هاتف للحجز',
    phoneDisplay: '+966 50 000 0000',
    phoneTel: '+966500000000',
    emailLabel: 'البريد الإلكتروني',
    email: 'info@drmdossary.com',
    hoursLabel: 'ساعات العمل',
    hours: 'السبت - الخميس: 9:00 ص - 9:00 م',
    bookUrl: '/book/',
  },
  en: {
    address: 'Riyadh, Saudi Arabia',
    addressLabel: 'Address',
    phoneLabel: 'Booking line',
    phoneDisplay: '+966 50 000 0000',
    phoneTel: '+966500000000',
    emailLabel: 'Email',
    email: 'info@drmdossary.com',
    hoursLabel: 'Hours',
    hours: 'Saturday – Thursday: 9:00 AM – 9:00 PM',
    bookUrl: '/en/book/',
  },
} as const

export const TRUST_BADGES = {
  ar: [
    'البورد السعودي في طب وجراحة العيون',
    'زمالة مستشفى الملك خالد التخصصي للعيون',
    'أحدث التقنيات والأجهزة العالمية',
    'رعاية شخصية ومتابعة بعد الجراحة',
  ],
  en: [
    'Saudi Board in Ophthalmology',
    'King Khaled Eye Specialist Hospital fellowship',
    'Latest international equipment',
    'Personalised follow-up care',
  ],
} as const

export const SERVICES = {
  ar: [
    {
      href: '/vision-correction-surgeries/',
      icon: '/uploads/2024/02/vision.png',
      image: '/uploads/2024/12/عملية-الليزك-للعيون-1024x666.jpg',
      name: 'جراحات تصحيح النظر',
      desc: 'أحدث تقنيات الليزك والليزر السطحي وزراعة العدسات لتصحيح قصر النظر، طول النظر، والاستجماتيزم بدقة عالية.',
    },
    {
      href: '/treatment-of-cataracts/',
      icon: '/uploads/2024/02/lasik.png',
      image: '/uploads/2024/12/lens-implant.jpg',
      name: 'علاج الماء الأبيض (الساد)',
      desc: 'علاج المياه البيضاء (الساد) بأحدث أنظمة الفاكو واستبدال العدسة لإعادة الرؤية الواضحة بأمان.',
    },
    {
      href: '/corneal-surgeries/',
      icon: '/uploads/2024/02/laser.png',
      image: '/uploads/2024/12/جراحة-العيون.jpg',
      name: 'جراحات القرنية',
      desc: 'علاج القرنية المخروطية وزراعة القرنية وتثبيتها (Cross-Linking) بإشراف استشاري بزمالة من مستشفى الملك خالد التخصصي للعيون.',
    },
  ],
  en: [
    {
      href: '/en/vision-correction-surgeries/',
      icon: '/uploads/2024/02/vision.png',
      image: '/uploads/2024/12/عملية-الليزك-للعيون-1024x666.jpg',
      name: 'Vision Correction Surgeries',
      desc: 'Advanced LASIK, surface laser (PRK), and implantable contact lens procedures to correct myopia, hyperopia, and astigmatism with precision.',
    },
    {
      href: '/en/treatment-of-cataracts/',
      icon: '/uploads/2024/02/lasik.png',
      image: '/uploads/2024/12/lens-implant.jpg',
      name: 'Cataract Treatment',
      desc: 'Modern phacoemulsification and premium lens implantation to restore clear vision safely.',
    },
    {
      href: '/en/corneal-surgeries/',
      icon: '/uploads/2024/02/laser.png',
      image: '/uploads/2024/12/جراحة-العيون.jpg',
      name: 'Corneal Surgeries',
      desc: 'Keratoconus management, corneal cross-linking, and corneal transplantation performed by a board-certified consultant with King Khaled Eye Specialist Hospital fellowship training.',
    },
  ],
} as const

export const FAQ_AR: Array<{ q: string; a: string }> = [
  {
    q: 'ما هي مؤهلات د. محمد الدوسري؟',
    a: 'د. محمد الدوسري حاصل على البورد السعودي في طب وجراحة العيون، وأكمل زمالة إكلينيكية متخصصة في مستشفى الملك خالد التخصصي للعيون، إحدى أكبر المراكز التخصصية لطب العيون في المنطقة.',
  },
  {
    q: 'ما هي الخدمات التي تقدمها العيادة؟',
    a: 'تشمل الخدمات جراحات تصحيح النظر (الليزك، الليزر السطحي، زراعة العدسات)، علاج المياه البيضاء (الساد) بأحدث أنظمة الفاكو، علاج القرنية المخروطية وتثبيتها وزراعتها، والفحص الشامل للعيون.',
  },
  {
    q: 'ما هي الإرشادات قبل عملية تصحيح النظر؟',
    a: 'يجب التوقف عن استخدام العدسات اللاصقة قبل الفحص بفترة كافية، وإجراء فحص شامل لقياس مقاسات القرنية والشبكية. ينصح بتجنب وضع المكياج حول العين قبل العملية بيوم على الأقل، وإحضار مرافق يوم الإجراء.',
  },
  {
    q: 'هل عملية الليزك آمنة؟',
    a: 'عمليات الليزك من أكثر الإجراءات الجراحية أمانًا عند إجرائها وفق بروتوكولات تشخيصية صارمة. تستخدم العيادة أنظمة ليزر متطورة، ويتم تقييم كل حالة بعناية قبل ترشيحها للجراحة.',
  },
  {
    q: 'كم تستغرق فترة التعافي بعد العملية؟',
    a: 'تتفاوت فترة التعافي حسب نوع الجراحة. غالبًا ما يستعيد المرضى رؤية واضحة خلال 24-48 ساعة بعد الليزك، مع متابعة دورية لضمان أفضل النتائج.',
  },
  {
    q: 'كيف يمكنني حجز موعد للاستشارة؟',
    a: 'يمكنك حجز موعد عبر صفحة تواصل معنا أو الاتصال بنا مباشرة. سيتواصل معك فريقنا لتأكيد الموعد.',
  },
]

export const FAQ_EN: Array<{ q: string; a: string }> = [
  {
    q: "What are Dr Al Dossary's qualifications?",
    a: 'Dr Mohammad Al Dossary is a Saudi Board-certified ophthalmologist and completed a clinical fellowship at King Khaled Eye Specialist Hospital, one of the leading specialised eye-care centres in the region.',
  },
  {
    q: 'Which services do you offer?',
    a: 'Vision-correction surgery (LASIK, surface laser, ICL implantation), cataract surgery using modern phacoemulsification systems, keratoconus management with cross-linking and corneal transplantation, and full diagnostic eye examinations.',
  },
  {
    q: 'How should I prepare for vision-correction surgery?',
    a: 'Stop wearing contact lenses well in advance of the diagnostic exam so we can take accurate corneal and retinal measurements. Avoid eye makeup the day before surgery and bring a companion on the day of the procedure.',
  },
  {
    q: 'Is LASIK safe?',
    a: 'LASIK is among the safest surgical procedures when performed under strict diagnostic protocols. The clinic uses advanced laser systems and evaluates each case carefully before recommending surgery.',
  },
  {
    q: 'How long is the recovery period?',
    a: 'Recovery varies by procedure. Most LASIK patients regain clear vision within 24–48 hours, with scheduled follow-ups to ensure the best long-term outcome.',
  },
  {
    q: 'How do I book a consultation?',
    a: 'Book through the Contact page or call us directly. Our team will confirm your appointment.',
  },
]

export const HERO_AR = {
  eyebrow: 'استشاري طب وجراحة العيون',
  title: 'رعاية شاملة لرؤية أوضح وحياة أفضل',
  lede: 'خلفية أكاديمية راسخة، البورد السعودي في طب وجراحة العيون، وزمالة إكلينيكية من مستشفى الملك خالد التخصصي للعيون — رعاية متخصصة في القرنية، الماء الأبيض، وجراحات تصحيح النظر.',
  primaryCta: { href: '/book/', label: 'احجز موعدك' },
  ghostCta: { href: '/services/', label: 'تعرّف على خدماتنا' },
} as const

export const HERO_EN = {
  eyebrow: 'Consultant Ophthalmologist',
  title: 'Comprehensive care for clearer vision and a better life',
  lede: 'A strong academic foundation, the Saudi Board in Ophthalmology, and a clinical fellowship from King Khaled Eye Specialist Hospital — specialised care in corneal, cataract, and vision-correction surgery.',
  primaryCta: { href: '/en/book/', label: 'Book an appointment' },
  ghostCta: { href: '/en/services/', label: 'Our services' },
} as const

export const WHY_AR = [
  {
    title: 'خبرة معتمدة',
    desc: 'البورد السعودي في طب وجراحة العيون وزمالة إكلينيكية متخصصة في مستشفى الملك خالد التخصصي للعيون.',
  },
  {
    title: 'أحدث التقنيات',
    desc: 'أنظمة ليزر متطورة، الفاكو، وتقنيات تشخيص دقيقة لضمان أفضل النتائج.',
  },
  {
    title: 'أمان ودقة',
    desc: 'بروتوكولات تشخيصية صارمة وفحوصات قبل العملية لضمان السلامة والنتائج المتميزة.',
  },
  {
    title: 'رعاية شخصية',
    desc: 'متابعة مستمرة بعد العملية ورعاية تتمحور حول كل مريض على حدة.',
  },
] as const

export const WHY_EN = [
  {
    title: 'Certified expertise',
    desc: 'Saudi Board in Ophthalmology and clinical fellowship at King Khaled Eye Specialist Hospital.',
  },
  {
    title: 'Modern technology',
    desc: 'Advanced laser platforms, phacoemulsification, and precise diagnostic tools to achieve the best outcomes.',
  },
  {
    title: 'Safety & precision',
    desc: 'Strict diagnostic protocols and pre-operative work-ups to ensure safety and excellent results.',
  },
  {
    title: 'Personalised care',
    desc: 'Continuous post-operative follow-up and care designed around each patient.',
  },
] as const
