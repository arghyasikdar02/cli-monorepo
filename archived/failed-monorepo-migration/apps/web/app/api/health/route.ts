import { databaseHealth } from '@cyberlabin/database'; import { ok } from '../_lib/http';
export async function GET(){ const db=await databaseHealth(); return ok({ status: db.ok ? 'ok' : 'degraded', services:['auth','course','enrollment','live','document','lab','quiz','progress','leaderboard','rag','crm','analytics','audit','cli-admin'], database: db }); }
