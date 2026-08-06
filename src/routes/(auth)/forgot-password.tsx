import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { requestPasswordReset } from '@/core/auth/client';
import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { localizeHref } from '@/paraglide/runtime.js';
import { usePublicConfig } from '@/hooks/use-public-config';
import { TextField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field';

import {
  musicRoomAuthCardClass,
  musicRoomAuthCardContentClass,
  musicRoomAuthCardHeaderClass,
  musicRoomAuthErrorClass,
  musicRoomAuthLinkClass,
  musicRoomAuthNoticeClass,
  musicRoomAuthPrimaryButtonClass,
  MusicRoomAuthShell,
} from './-music-room-auth-shell';

const forgotSchema = z.object({
  email: z.string().email(m['common.sign.email_placeholder']()),
});

function ForgotPasswordPage() {
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const configQuery = usePublicConfig();
  const configs = configQuery.data ?? {};

  const configsLoaded = configQuery.isSuccess;
  const passwordResetEnabled = configs.password_reset_enabled === 'true';

  const form = useForm({
    defaultValues: { email: '' },
    validators: { onSubmit: forgotSchema },
    onSubmit: async ({ value }) => {
      setError('');
      try {
        const origin = window.location.origin;
        const redirectTo = `${origin}${localizeHref('/reset-password')}`;
        const result = await requestPasswordReset({
          email: value.email,
          redirectTo,
        });
        if (result.error) {
          setError(result.error.message || 'Request failed');
        } else {
          setSentEmail(value.email);
          setSent(true);
        }
      } catch (err: any) {
        setError(err.message || 'Request failed');
      }
    },
  });

  return (
    <MusicRoomAuthShell appName={configs.app_name || envConfigs.app_name}>
      <Card className={musicRoomAuthCardClass}>
        <CardHeader className={musicRoomAuthCardHeaderClass}>
          <h1 className="font-serif text-[1.75rem] leading-[1.1] font-normal text-[#1d2a24]">
            {sent
              ? m['common.sign.reset_link_sent_title']()
              : m['common.sign.forgot_password_title']()}
          </h1>
          {!sent && (
            <CardDescription className="mt-2 leading-6 text-[#665f52]">
              {m['common.sign.forgot_password_description']()}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className={musicRoomAuthCardContentClass}>
          {configsLoaded && !passwordResetEnabled ? (
            <FieldGroup>
              <div className={musicRoomAuthNoticeClass}>
                <p className="text-sm font-semibold text-[#314035]">
                  {m['common.sign.password_reset_unavailable_title']()}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#665f52]">
                  {m['common.sign.password_reset_unavailable_description']()}
                </p>
              </div>
              <Field>
                <Link
                  href="/sign-in"
                  className={`text-center text-sm ${musicRoomAuthLinkClass}`}
                >
                  {m['common.sign.back_to_sign_in']()}
                </Link>
              </Field>
            </FieldGroup>
          ) : sent ? (
            <FieldGroup>
              <p className="text-center text-sm leading-6 text-[#665f52]">
                {m['common.sign.reset_link_sent_description']({
                  email: sentEmail,
                })}
              </p>
              <Field>
                <Link
                  href="/sign-in"
                  className={`text-center text-sm ${musicRoomAuthLinkClass}`}
                >
                  {m['common.sign.back_to_sign_in']()}
                </Link>
              </Field>
            </FieldGroup>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <FieldGroup>
                {error && (
                  <div
                    id="forgot-password-error"
                    role="alert"
                    className={musicRoomAuthErrorClass}
                  >
                    {error}
                  </div>
                )}
                <form.Field name="email">
                  {(field) => (
                    <TextField
                      field={field}
                      label={m['common.sign.email_title']()}
                      type="email"
                      required
                      placeholder={m['common.sign.email_placeholder']()}
                    />
                  )}
                </form.Field>
                <Field>
                  <form.Subscribe selector={(s) => s.isSubmitting}>
                    {(isSubmitting) => (
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className={musicRoomAuthPrimaryButtonClass}
                      >
                        {isSubmitting
                          ? '...'
                          : m['common.sign.send_reset_link']()}
                      </Button>
                    )}
                  </form.Subscribe>
                  <FieldDescription className="text-center text-[#665f52]">
                    <Link href="/sign-in" className={musicRoomAuthLinkClass}>
                      {m['common.sign.back_to_sign_in']()}
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </MusicRoomAuthShell>
  );
}

export const Route = createFileRoute('/(auth)/forgot-password')({
  head: () => ({
    meta: [{ name: 'robots', content: 'noindex,follow' }],
  }),
  component: ForgotPasswordPage,
});
