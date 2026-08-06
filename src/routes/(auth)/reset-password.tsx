import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { resetPassword } from '@/core/auth/client';
import { Link, useRouter } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
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

const resetSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: m['common.sign.password_mismatch'](),
  });

function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const linkError = params.get('error');
    setToken(linkError ? null : tokenParam);
    setTokenChecked(true);
  }, []);

  const form = useForm({
    defaultValues: { password: '', confirmPassword: '' },
    validators: { onSubmit: resetSchema },
    onSubmit: async ({ value }) => {
      setError('');
      if (!token) {
        setError(m['common.sign.reset_password_missing_token']());
        return;
      }
      try {
        const result = await resetPassword({
          newPassword: value.password,
          token,
        });
        if (result.error) {
          setError(result.error.message || 'Reset failed');
        } else {
          setSuccess(true);
          setTimeout(() => router.push('/sign-in'), 1500);
        }
      } catch (err: any) {
        setError(err.message || 'Reset failed');
      }
    },
  });

  return (
    <MusicRoomAuthShell appName={envConfigs.app_name}>
      <Card className={musicRoomAuthCardClass}>
        <CardHeader className={musicRoomAuthCardHeaderClass}>
          <h1 className="font-serif text-[1.75rem] leading-[1.1] font-normal text-[#1d2a24]">
            {m['common.sign.reset_password_title']()}
          </h1>
          {!success && tokenChecked && token && (
            <CardDescription className="mt-2 leading-6 text-[#665f52]">
              {m['common.sign.reset_password_description']()}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className={musicRoomAuthCardContentClass}>
          {!tokenChecked ? null : !token ? (
            <FieldGroup>
              <div
                id="reset-password-error"
                role="alert"
                className={`${musicRoomAuthErrorClass} text-center`}
              >
                {m['common.sign.reset_password_invalid_token']()}
              </div>
              <Field>
                <Link
                  href="/forgot-password"
                  className={`text-center text-sm ${musicRoomAuthLinkClass}`}
                >
                  {m['common.sign.forgot_password_title']()}
                </Link>
              </Field>
            </FieldGroup>
          ) : success ? (
            <FieldGroup>
              <p
                className={`${musicRoomAuthNoticeClass} text-sm text-[#314035]`}
              >
                {m['common.sign.reset_password_success']()}
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
                    id="reset-password-submit-error"
                    role="alert"
                    className={musicRoomAuthErrorClass}
                  >
                    {error}
                  </div>
                )}
                <form.Field name="password">
                  {(field) => (
                    <TextField
                      field={field}
                      label={m['common.sign.new_password_title']()}
                      type="password"
                      required
                      placeholder={m['common.sign.new_password_placeholder']()}
                    />
                  )}
                </form.Field>
                <form.Field name="confirmPassword">
                  {(field) => (
                    <TextField
                      field={field}
                      label={m['common.sign.confirm_password_title']()}
                      type="password"
                      required
                      placeholder={m[
                        'common.sign.confirm_new_password_placeholder'
                      ]()}
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
                          : m['common.sign.reset_password_submit']()}
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

export const Route = createFileRoute('/(auth)/reset-password')({
  head: () => ({
    meta: [{ name: 'robots', content: 'noindex,follow' }],
  }),
  component: ResetPasswordPage,
});
