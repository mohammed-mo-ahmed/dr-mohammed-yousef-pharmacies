import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {updateSession} from '@/lib/supabase/middleware';
import {type NextRequest} from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // First: refresh Supabase session (sets cookies)
  const supabaseResponse = await updateSession(request);

  // Second: run next-intl middleware (may redirect for locale)
  const intlResponse = intlMiddleware(request);

  // Merge: copy next-intl headers/redirects into supabase response
  if (intlResponse.status !== 200 || intlResponse.headers.get('location')) {
    // next-intl wants to redirect or return error — pass through
    // but preserve supabase cookies
    supabaseResponse.headers.forEach((value, key) => {
      intlResponse.headers.set(key, value);
    });
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return intlResponse;
  }

  return supabaseResponse;
}

export const config = {
  // Match only internationalized pathnames.
  matcher: [
    // Match all pathnames except for
    // - API routes (/api)
    // - Static files (/static, /_next, etc.)
    // - File extensions (e.g. favicon.ico, images, etc.)
    // - Auth callback routes (handled by Supabase)
    '/((?!api|_next|auth|.*\\..*).*)',
    // Match the root directory specifically
    '/'
  ]
};
