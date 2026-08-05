import { createFileRoute } from '@tanstack/react-router';

import { getAuth } from '@/core/auth';
import { AUTH_SECRET_PLACEHOLDER, envConfigs } from '@/config';
import { getDbConfigs } from '@/modules/config/service';

// better-auth catch-all — the handler takes a standard Request and
// returns a standard Response, so it mounts directly.
async function handle(request: Request) {
  if (!hasAuthInfrastructure()) {
    return authUnavailableResponse(request);
  }

  const configs = await getDbConfigs();
  const auth = getAuth(configs);
  return auth.handler(request);
}

function hasAuthInfrastructure() {
  const hasAuthSecret =
    envConfigs.auth_secret &&
    envConfigs.auth_secret !== AUTH_SECRET_PLACEHOLDER;
  const hasDatabase =
    envConfigs.database_provider === 'd1' || Boolean(envConfigs.database_url);

  return Boolean(hasAuthSecret && hasDatabase);
}

function authUnavailableResponse(request: Request) {
  const headers = {
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex',
  };

  if (new URL(request.url).pathname.endsWith('/get-session')) {
    // Public installs do not use the scaffold's optional auth system. The
    // client still probes this endpoint, where null is the valid signed-out state.
    return Response.json(null, { headers });
  }

  return Response.json(
    {
      code: 'AUTH_NOT_CONFIGURED',
      message:
        'Authentication is not configured for this deployment. Set AUTH_SECRET and a database connection before enabling sign-in.',
    },
    { status: 503, headers }
  );
}

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      POST: ({ request }) => handle(request),
    },
  },
});
