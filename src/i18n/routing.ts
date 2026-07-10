import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['ar', 'en'],

  // Used when no locale matches
  defaultLocale: 'ar',
  
  // Custom prefix option. We can use "as-needed" so that the default locale (Arabic)
  // doesn't have an "/ar" prefix in the URL.
  localePrefix: 'always'
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration.
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
