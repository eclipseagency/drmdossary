import type { Metadata, Viewport } from 'next'
import { Inter, Cairo } from 'next/font/google'
import { headers } from 'next/headers'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { langFromPath, dirFor } from '@/lib/i18n'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-cairo',
})

export const viewport: Viewport = {
  themeColor: '#0a4d68',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://drmdossary.com'),
  title: {
    default: 'د. محمد الدوسري — استشاري طب وجراحة العيون',
    template: '%s',
  },
  description: 'رعاية شاملة لطب وجراحة العيون: تصحيح النظر، علاج المياه البيضاء، وجراحات القرنية.',
  icons: {
    icon: '/uploads/2024/03/cropped-fav-32x32.png',
    apple: '/uploads/2024/03/cropped-fav-180x180.png',
  },
  openGraph: {
    images: ['/uploads/2024/02/DSC08886-1-removebg-preview.png'],
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers()
  const pathname = h.get('x-pathname') || '/'
  const lang = langFromPath(pathname)
  const dir = dirFor(lang)

  return (
    <html lang={lang} dir={dir} className={`${inter.variable} ${cairo.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-[100] focus:px-3 focus:py-2 focus:bg-white focus:text-brand-900 focus:rounded focus:shadow-soft"
        >
          Skip to content
        </a>
        <Header lang={lang} pathname={pathname} />
        <main id="main">{children}</main>
        <Footer lang={lang} />
      </body>
    </html>
  )
}
