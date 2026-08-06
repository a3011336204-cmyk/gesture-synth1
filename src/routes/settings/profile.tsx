import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { apiGet } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';

import { SettingsForm } from './-settings-form';

function SettingsPage() {
  const userQuery = useQuery({
    queryKey: ['user-info'],
    queryFn: async () => {
      const data = await apiGet<{
        name?: string;
        email?: string;
        image?: string;
      }>('/api/user/info');
      return {
        name: data.name || '',
        email: data.email || '',
        image: data.image || '',
      };
    },
  });

  if (userQuery.isError) {
    return (
      <div className="studio-page">
        <div className="studio-page-header">
          <div>
            <h1 className="studio-page-title">
              {m['settings.profile.title']()}
            </h1>
            <p className="studio-page-description">
              {m['settings.profile.description']()}
            </p>
          </div>
        </div>
        <div
          className="flex min-h-28 flex-col items-center justify-center gap-3 border border-[#c6b299] bg-[#fbf7ef] px-5 text-center text-sm text-[#615c51]"
          role="alert"
        >
          <span>{m['common.error.message']()}</span>
          <button
            type="button"
            onClick={() => void userQuery.refetch()}
            className="min-h-11 rounded-md bg-[#a95230] px-4 py-2 font-semibold text-[#fff7eb] transition-[background-color,transform] hover:-translate-y-px hover:bg-[#913f24] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b95c33] active:translate-y-0"
          >
            {m['common.error.retry']()}
          </button>
        </div>
      </div>
    );
  }

  if (userQuery.isPending || !userQuery.data) {
    return (
      <div className="studio-page">
        <div className="studio-page-header">
          <div>
            <h1 className="studio-page-title">
              {m['settings.profile.title']()}
            </h1>
            <p className="studio-page-description">
              {m['settings.profile.description']()}
            </p>
          </div>
        </div>
        <div
          className="flex min-h-28 items-center border border-dashed border-[#c6b299] bg-[#fbf7ef] px-5 text-sm text-[#615c51]"
          role="status"
        >
          {m['settings.profile.loading']()}
        </div>
      </div>
    );
  }

  return (
    <SettingsForm
      name={userQuery.data.name}
      email={userQuery.data.email}
      image={userQuery.data.image}
    />
  );
}

export const Route = createFileRoute('/settings/profile')({
  component: SettingsPage,
});
