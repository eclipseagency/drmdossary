import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="min-h-[60vh] flex items-center bg-gradient-brand text-white">
      <div className="container py-20 text-center">
        <p className="eyebrow-pill bg-white/15 text-white mb-4">404</p>
        <h1 className="text-4xl md:text-5xl text-white mb-4">الصفحة غير موجودة / Page not found</h1>
        <p className="text-white/85 max-w-xl mx-auto mb-8">
          عذرًا، لم نتمكن من العثور على الصفحة المطلوبة. ربما تم نقلها أو حذفها.
          <br />
          Sorry, we couldn’t find that page.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/" className="btn btn-lg btn-light">العودة للرئيسية</Link>
          <Link href="/en/" className="btn btn-lg btn-outline-light">Back to home</Link>
        </div>
      </div>
    </section>
  )
}
