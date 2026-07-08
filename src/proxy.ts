import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames.
  // This matches the root, locale routes, and excludes system folders/static files.
  matcher: [
    // Match all pathnames except for
    // - API routes (/api)
    // - Static files (/static, /_next, etc.)
    // - File extensions (e.g. favicon.ico, images, etc.)
    '/((?!api|_next|.*\\..*).*)',
    // Match the root directory specifically
    '/'
  ]
};
