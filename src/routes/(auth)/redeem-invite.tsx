import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { signOut, useSession } from '@/core/auth/client';
import { useRouter } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { apiGet, apiPost } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import {
  musicRoomAuthCardClass,
  musicRoomAuthCardContentClass,
  musicRoomAuthCardHeaderClass,
  musicRoomAuthErrorClass,
  musicRoomAuthLinkClass,
  musicRoomAuthPrimaryButtonClass,
  MusicRoomAuthShell,
} from './-music-room-auth-shell';

function RedeemInvitePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [checkingError, setCheckingError] = useState(false);
  const [checkAttempt, setCheckAttempt] = useState(0);

  // Must be signed in; if no invite is actually needed, leave.
  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.push('/sign-in');
      return;
    }
    let cancelled = false;
    setChecking(true);
    setCheckingError(false);
    apiGet<{ needsInvite?: boolean }>('/api/user/info')
      .then((res) => {
        if (cancelled) return;
        if (!res.needsInvite) {
          router.push('/settings');
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setChecking(false);
        setCheckingError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [checkAttempt, isPending, session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const trimmed = code.trim();
    if (!trimmed) {
      setError(m['common.sign.invite_code_required']());
      return;
    }
    setLoading(true);
    try {
      await apiPost('/api/invite-codes/validate', { code: trimmed });
      await apiPost('/api/invite-codes/redeem', { code: trimmed });

      // Hard navigation so the new plan/membership is reflected everywhere.
      window.location.assign(localizeHref('/settings'));
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : m['common.sign.invite_code_invalid']()
      );
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push('/sign-in');
  }

  if (isPending || checking) {
    return (
      <MusicRoomAuthShell appName={envConfigs.app_name}>
        <Card className={musicRoomAuthCardClass}>
          <CardContent className={musicRoomAuthCardContentClass}>
            <div className="flex min-h-28 items-center justify-center">
              <div className="size-6 animate-spin rounded-full border-2 border-[#9a4f2e] border-t-transparent" />
            </div>
          </CardContent>
        </Card>
      </MusicRoomAuthShell>
    );
  }

  if (checkingError) {
    return (
      <MusicRoomAuthShell appName={envConfigs.app_name}>
        <Card className={musicRoomAuthCardClass}>
          <CardContent className={musicRoomAuthCardContentClass}>
            <div
              className="flex flex-col items-center gap-4 py-5 text-center"
              role="alert"
            >
              <p className="font-serif text-xl text-[#1d2a24]">
                {m['common.error.title']()}
              </p>
              <p className="text-sm leading-6 text-[#665f52]">
                {m['common.error.message']()}
              </p>
              <Button
                type="button"
                className={musicRoomAuthPrimaryButtonClass}
                onClick={() => setCheckAttempt((attempt) => attempt + 1)}
              >
                {m['common.error.retry']()}
              </Button>
            </div>
          </CardContent>
        </Card>
      </MusicRoomAuthShell>
    );
  }

  return (
    <MusicRoomAuthShell appName={envConfigs.app_name}>
      <Card className={musicRoomAuthCardClass}>
        <CardHeader className={musicRoomAuthCardHeaderClass}>
          <h1 className="font-serif text-[1.75rem] leading-[1.1] font-normal text-[#1d2a24]">
            {m['common.sign.redeem_title']()}
          </h1>
        </CardHeader>
        <CardContent className={musicRoomAuthCardContentClass}>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <div
                  id="redeem-invite-error"
                  role="alert"
                  className={musicRoomAuthErrorClass}
                >
                  {error}
                </div>
              )}
              <p className="text-sm leading-6 text-[#665f52]">
                {m['common.sign.redeem_description']()}
              </p>
              <Field>
                <FieldLabel htmlFor="invite-code">
                  {m['common.sign.invite_code_title']()}
                </FieldLabel>
                <Input
                  id="invite-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={m['common.sign.invite_code_placeholder']()}
                  required
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? 'redeem-invite-error' : undefined}
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={loading}
                  className={musicRoomAuthPrimaryButtonClass}
                >
                  {loading ? '...' : m['common.sign.redeem_submit']()}
                </Button>
                <FieldDescription className="text-center text-[#665f52]">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className={musicRoomAuthLinkClass}
                  >
                    {m['common.sign.sign_out_title']()}
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </MusicRoomAuthShell>
  );
}

export const Route = createFileRoute('/(auth)/redeem-invite')({
  head: () => ({
    meta: [{ name: 'robots', content: 'noindex,follow' }],
  }),
  component: RedeemInvitePage,
});
