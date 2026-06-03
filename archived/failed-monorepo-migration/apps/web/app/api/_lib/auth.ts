import { NextRequest } from 'next/server';
import { parseAuthHeaders, assertRole, type AuthContext } from '@cyberlabin/auth-guards';
export function requireAuth(req: NextRequest): AuthContext { return parseAuthHeaders(req.headers); }
export function requireRole(req: NextRequest, roles: string[]): AuthContext { const ctx=requireAuth(req); assertRole(ctx,roles); return ctx; }
