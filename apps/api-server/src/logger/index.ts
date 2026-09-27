import { config } from '@/configs';
import { toInstant } from '@kalya/utils';
import path from 'node:path';
import pc from 'picocolors';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

/**
 * Standard log level enum for severity classification.
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Custom logging levels configuration for Winston.
 * Lower numeric value corresponds to higher severity.
 */
export const CustomLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
} as const satisfies winston.config.AbstractConfigSetLevels;

/**
 * Structured metadata interface for attaching context to log entries.
 */
export interface LogMeta {
  service?: string;
  environment?: 'local' | 'development' | 'staging' | 'production';
  version?: string;
  requestId?: string;
  method?: string;
  path?: string;
  route?: string;
  status?: number;
  latency_ms?: number;
  ip?: string;
  traceId?: string;
  spanId?: string;
  userId?: string | number;
  role?: string;
  error?: string;
  stack?: string;
  errorCode?: string;
  hostname?: string;
  dbQuery?: string;
  dbDuration?: number;
  [key: string]: unknown;
}

/**
 * Internal interface extending Winston's TransformableInfo.
 */
interface LogInfo extends winston.Logform.TransformableInfo {
  timestamp?: string;
  logMetadata?: LogMeta;
  stack?: string;
}

/**
 * Millisecond fields that should be rounded for display.
 */
const MS_FIELDS = ['latency_ms', 'dbDuration'] as const;

/**
 * Rounds a millisecond duration value to two decimal places.
 *
 * @description Rounds the given numeric millisecond value to 2 decimal points.
 *
 * @param {number} value - The raw millisecond value to round.
 * @returns {number} The rounded millisecond number.
 */
function roundMs(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Normalizes log metadata by rounding duration and latency values.
 *
 * @description Clones the provided log metadata object and rounds numeric millisecond
 * fields (latency_ms, dbDuration) to two decimal places for cleaner output.
 *
 * @param {LogMeta} [meta] - The optional log metadata object to normalize.
 * @returns {LogMeta | undefined} The normalized log metadata, or undefined if none provided.
 */
function normalizeMeta(meta?: LogMeta): LogMeta | undefined {
  if (!meta) return meta;
  const normalized: LogMeta = { ...meta };
  for (const key of MS_FIELDS) {
    const value = normalized[key];
    if (typeof value === 'number') {
      normalized[key] = roundMs(value);
    }
  }
  return normalized;
}

/**
 * Formats a timestamp into a standardized human-readable date and time string.
 *
 * @description Uses @kalya/utils to convert timestamp inputs into a Temporal.Instant
 * and formats them into 'YYYY-MM-DD hh:mm:ss A' format without external dependencies like dayjs.
 *
 * @param {string | number | Date} [timestamp] - The timestamp to format.
 * @returns {string} The formatted date and time string.
 */
function formatTimestamp(timestamp?: string | number | Date): string {
  if (!timestamp) return '';
  try {
    const instant =
      typeof timestamp === 'string' && !timestamp.includes('T') && !timestamp.endsWith('Z')
        ? toInstant(new Date(timestamp))
        : toInstant(timestamp);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const zdt = instant.toZonedDateTimeISO(timeZone);
    const dateStr = zdt.toPlainDate().toString();
    const timeStr = zdt.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    return `${dateStr} ${timeStr}`;
  } catch {
    return String(timestamp);
  }
}

/**
 * Console format: short and readable.
 *
 * @description Strips stack out of the printed metadata JSON so it is not duplicated,
 * and prints a single-line stack summary for console output.
 */
const consoleFormat = winston.format.printf((info) => {
  const { timestamp, level, message, logMetadata, stack } = info as LogInfo;
  const time = formatTimestamp(timestamp as string);
  const levelTag = level.toUpperCase().padEnd(8);
  const appName = config.app.name;
  const prefix = `[${appName.charAt(0).toUpperCase() + appName.slice(1)} ${time}]`;

  // Don't print the stack inside the metadata JSON blob on console.
  const { stack: _metaStack, ...restMeta } = logMetadata ?? {};
  const metadata = Object.keys(restMeta).length > 0 ? pc.dim(` ${JSON.stringify(restMeta)}`) : '';

  const resolvedStack = stack ?? logMetadata?.stack;
  // Only show the first line of the stack on console. Full trace goes to the log file.
  const shortStack = resolvedStack ? resolvedStack.split('\n')[1]?.trim() : undefined;
  const errorStack = shortStack ? pc.red(`\n    ↳ ${shortStack}`) : '';

  switch (level) {
    case 'info':
      return `${pc.blue(prefix)} ${pc.cyan(levelTag)} ${message} ${metadata}`;
    case 'warn':
      return `${pc.yellow(prefix)} ${pc.yellow(levelTag)} ${message}${metadata}`;
    case 'error':
      return `${pc.red(prefix)} ${pc.red(levelTag)} ${pc.bold('✖  ' + (message as string))}${metadata}${errorStack}`;
    case 'debug':
      return `${pc.dim(prefix)} ${pc.gray(levelTag)} ${pc.italic(message as string)}${metadata}`;
    default:
      return `${prefix} ${levelTag} ${message}${metadata}`;
  }
});

const internalLogger = winston.createLogger({
  levels: CustomLevels,
  level: config.observability.logging.level === 'debug' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true })
  ),
  transports: [
    // Console: short/readable, no full stack noise.
    new winston.transports.Console({
      format: winston.format.combine(consoleFormat),
    }),
    // File: full JSON, including the complete stack trace for debugging.
    new DailyRotateFile({
      filename: path.join(process.cwd(), 'logs', `${config.app.name}-%DATE%.log`),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
      format: winston.format.combine(winston.format.json()),
    }),
  ],
});

/**
 * Application-wide logging utility providing structured logging methods.
 */
const logger = {
  /**
   * Logs an informational message.
   *
   * @param {string} msg - The informational message.
   * @param {LogMeta} [meta] - Optional contextual metadata.
   */
  info: (msg: string, meta?: LogMeta) =>
    internalLogger.log('info', msg, { logMetadata: normalizeMeta(meta) }),

  /**
   * Logs a warning message.
   *
   * @param {string} msg - The warning message.
   * @param {LogMeta} [meta] - Optional contextual metadata.
   */
  warn: (msg: string, meta?: LogMeta) =>
    internalLogger.log('warn', msg, { logMetadata: normalizeMeta(meta) }),

  /**
   * Logs an error message or caught exception.
   *
   * @param {unknown} err - Error object, string message, or unhandled exception.
   * @param {LogMeta} [meta] - Optional contextual metadata.
   */
  error: (err: unknown, meta?: LogMeta) => {
    if (err instanceof Error) {
      internalLogger.log('error', err.message, {
        stack: err.stack,
        logMetadata: normalizeMeta(meta),
      });
    } else if (typeof err === 'string') {
      internalLogger.log('error', err, { logMetadata: normalizeMeta(meta) });
    } else {
      internalLogger.log('error', 'An unhandled exception occurred', {
        logMetadata: normalizeMeta({ rawError: err, ...meta }),
      });
    }
  },

  /**
   * Logs a debug message.
   *
   * @param {string} msg - The debug message.
   * @param {LogMeta} [meta] - Optional contextual metadata.
   */
  debug: (msg: string, meta?: LogMeta) =>
    internalLogger.log('debug', msg, { logMetadata: normalizeMeta(meta) }),
};

export const log = logger;

export type { LogInfo };
