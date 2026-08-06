import { getConfig } from '@/modules/config/service';
import { getUserPlan } from '@/modules/invite-codes/service';
import { hasPermission } from '@/modules/rbac/service';

/**
 * Check the same invite/trial boundary used by the authenticated app shell.
 * API routes call this separately because client-side redirects are not an
 * authorization boundary.
 */
export async function isUserEntitled(userId: string): Promise<boolean> {
  if (!userId.trim()) {
    throw new Error('Cannot check entitlement without a user id');
  }

  const inviteRequired =
    (await getConfig('invite_code_required', { failOnDatabaseError: true })) ===
    'true';
  if (!inviteRequired) return true;

  const { plan } = await getUserPlan(userId);
  if (plan === 'trial' || plan === 'member') return true;

  return hasPermission(userId, 'admin.*');
}
