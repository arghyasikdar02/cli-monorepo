export type LogMeta = Record<string, unknown>;
const redact = (meta: LogMeta = {}) => Object.fromEntries(Object.entries(meta).map(([k,v]) => [/token|secret|password|key/i.test(k) ? [k,'[redacted]'] : [k,v]]));
export const logger = {
  info: (message: string, meta?: LogMeta) => console.info(JSON.stringify({ level: 'info', message, ...redact(meta) })),
  warn: (message: string, meta?: LogMeta) => console.warn(JSON.stringify({ level: 'warn', message, ...redact(meta) })),
  error: (message: string, meta?: LogMeta) => console.error(JSON.stringify({ level: 'error', message, ...redact(meta) }))
};
