export * from './courseAccess';
export type AuthContext = { userId: string; roles: string[]; email?: string };
export class AuthRequiredError extends Error { code = 'UNAUTHENTICATED'; }
export class RbacDeniedError extends Error { code = 'FORBIDDEN'; }
export function parseAuthHeaders(headers: Headers): AuthContext {
  const userId = headers.get('x-user-id');
  if (!userId) throw new AuthRequiredError('Authentication required');
  const roles = (headers.get('x-roles') || 'student').split(',').map((role) => role.trim()).filter(Boolean);
  return { userId, roles, email: headers.get('x-user-email') || undefined };
}
export function assertRole(ctx: AuthContext, allowed: string[]) {
  if (!ctx.roles.some((role) => allowed.includes(role))) throw new RbacDeniedError('Insufficient role');
}
