import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Inject the request pathname into a response header so server components
 * (specifically the root layout) can set `<html lang>` and `<html dir>`
 * based on the URL — we don't need a [locale] dynamic segment that way,
 * and existing URL paths like `/about-us/` / `/en/about-us/` keep working.
 */
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers)
  headers.set('x-pathname', request.nextUrl.pathname)
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|uploads|api).*)'],
}
