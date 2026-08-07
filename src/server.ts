import handler from '@tanstack/react-start/server-entry';

import { CANONICAL_SITE_URL } from './config';
import { getCookieFromHeader } from './lib/cookie';
import { paraglideMiddleware } from './paraglide/server.js';

// On Cloudflare Workers, stash the binding env (D1, ASSETS, …) on globalThis
// so synchronous code paths (e.g. the db() singleton with DATABASE_PROVIDER=d1)
// can reach bindings without threading the request context through every call.
// The specifier is kept non-literal so bundlers leave the import to runtime;
// outside workerd the import rejects and we just move on.
const CF_WORKERS_MODULE = 'cloudflare:workers';
let cfEnvPromise: Promise<void> | null = null;

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https:",
  "font-src 'self' data:",
  "media-src 'self' blob: data:",
  "connect-src 'self' https: ws: wss:",
  "worker-src 'self' blob:",
  "frame-src 'self' https:",
].join('; ');

const NOINDEX_ROUTE_PREFIXES = [
  '/admin',
  '/settings',
  '/api',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/auth-callback',
  '/redeem-invite',
] as const;

const CANONICAL_SITE_HOSTNAME = new URL(CANONICAL_SITE_URL).hostname;
const LEGACY_SITE_HOSTNAMES = new Set([
  'gesture-synth-five.vercel.app',
  'gesturesynth.co',
]);

export function getCanonicalSiteRedirect(request: Request): Response | null {
  const requestUrl = new URL(request.url);
  const isCanonicalHttpsRequest =
    requestUrl.hostname === CANONICAL_SITE_HOSTNAME &&
    requestUrl.protocol === 'https:';
  const isKnownCanonicalAlias =
    requestUrl.hostname === CANONICAL_SITE_HOSTNAME ||
    LEGACY_SITE_HOSTNAMES.has(requestUrl.hostname);
  if (isCanonicalHttpsRequest || !isKnownCanonicalAlias) {
    return null;
  }

  const redirectUrl = new URL(CANONICAL_SITE_URL);
  redirectUrl.pathname = requestUrl.pathname;
  redirectUrl.search = requestUrl.search;

  return new Response(null, {
    status: 308,
    headers: { Location: redirectUrl.href },
  });
}

function isNoindexRoute(pathname: string): boolean {
  // Paraglide may prefix a localized URL (for example, /zh/settings). Keep
  // the response-level rule aligned with the route-level metadata in either
  // form.
  const routePath = pathname.replace(/^\/(?:en|zh)(?=\/|$)/, '') || '/';
  return NOINDEX_ROUTE_PREFIXES.some(
    (prefix) => routePath === prefix || routePath.startsWith(`${prefix}/`)
  );
}

function setSecurityHeaders(response: Response, request: Request): void {
  response.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(self), microphone=(self), geolocation=(), payment=(), usb=()'
  );

  if (isNoindexRoute(new URL(request.url).pathname)) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  if (new URL(request.url).protocol === 'https:') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }
}

function ensureCloudflareEnv(): Promise<void> {
  if (!cfEnvPromise) {
    cfEnvPromise = import(/* @vite-ignore */ CF_WORKERS_MODULE)
      .then((mod) => {
        (globalThis as any).__CF_ENV__ = mod.env;
      })
      .catch(() => {
        // Not running on Cloudflare Workers — nothing to stash.
      });
  }
  return cfEnvPromise;
}

// Custom server entry — wraps every request in Paraglide's middleware so
// getLocale() resolves per-request (AsyncLocalStorage) during SSR.
export default {
  async fetch(req: Request): Promise<Response> {
    const canonicalSiteRedirect = getCanonicalSiteRedirect(req);
    if (canonicalSiteRedirect) {
      setSecurityHeaders(canonicalSiteRedirect, req);
      return canonicalSiteRedirect;
    }

    await ensureCloudflareEnv();
    const response = await paraglideMiddleware(req, () => handler.fetch(req));
    setSecurityHeaders(response, req);
    const utmSource = new URL(req.url).searchParams.get('utm_source');
    const existing = getCookieFromHeader(
      req.headers.get('cookie'),
      'utm_source'
    );
    if (utmSource && !existing) {
      const sanitized = utmSource.replace(/[^\w.\-]/g, '').slice(0, 100);
      if (sanitized) {
        response.headers.append(
          'Set-Cookie',
          `utm_source=${sanitized}; Max-Age=2592000; Path=/; SameSite=Lax`
        );
      }
    }
    return response;
  },
};
