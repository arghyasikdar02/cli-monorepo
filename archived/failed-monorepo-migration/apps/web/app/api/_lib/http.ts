import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
export function ok<T>(data:T, init?: ResponseInit){ return NextResponse.json(data, init); }
export function apiError(code:string, message:string, status=400, details?:unknown){ return NextResponse.json({ error:{ code, message, details } }, { status }); }
export function handleError(error:unknown){ if(error instanceof ZodError) return apiError('VALIDATION_ERROR','Invalid request payload',400,error.flatten()); if(error instanceof Error && 'code' in error){ const code=String((error as any).code); return apiError(code,error.message,code==='UNAUTHENTICATED'?401:403); } console.error(error); return apiError('INTERNAL_ERROR','Unexpected server error',500); }
