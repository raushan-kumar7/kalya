/**
 * Standard HTTP Status Codes registry.
 *
 * @description Provides strongly typed numeric constants for standard RFC HTTP status codes.
 */
export const HttpStatus = {
  // ---- 1xx Informational ----
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102,
  EARLY_HINTS: 103,

  // ---- 2xx Success ----
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTI_STATUS: 207,
  ALREADY_REPORTED: 208,
  IM_USED: 226,

  // ---- 3xx Redirection ----
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,

  // ---- 4xx Client Errors ----
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,

  // ---- 5xx Server Errors ----
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511,
} as const;

/** Union of all valid HTTP status code numbers. */
export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];

/** Union of all valid HTTP status code constant names. */
export type HttpStatusName = keyof typeof HttpStatus;

/**
 * Standard human-readable reason phrases for HTTP status codes.
 */
export const HttpStatusPhrase: Record<HttpStatusCode, string> = {
  [HttpStatus.CONTINUE]: 'Continue',
  [HttpStatus.SWITCHING_PROTOCOLS]: 'Switching Protocols',
  [HttpStatus.PROCESSING]: 'Processing',
  [HttpStatus.EARLY_HINTS]: 'Early Hints',

  [HttpStatus.OK]: 'OK',
  [HttpStatus.CREATED]: 'Created',
  [HttpStatus.ACCEPTED]: 'Accepted',
  [HttpStatus.NON_AUTHORITATIVE_INFORMATION]: 'Non-Authoritative Information',
  [HttpStatus.NO_CONTENT]: 'No Content',
  [HttpStatus.RESET_CONTENT]: 'Reset Content',
  [HttpStatus.PARTIAL_CONTENT]: 'Partial Content',
  [HttpStatus.MULTI_STATUS]: 'Multi-Status',
  [HttpStatus.ALREADY_REPORTED]: 'Already Reported',
  [HttpStatus.IM_USED]: 'IM Used',

  [HttpStatus.MULTIPLE_CHOICES]: 'Multiple Choices',
  [HttpStatus.MOVED_PERMANENTLY]: 'Moved Permanently',
  [HttpStatus.FOUND]: 'Found',
  [HttpStatus.SEE_OTHER]: 'See Other',
  [HttpStatus.NOT_MODIFIED]: 'Not Modified',
  [HttpStatus.TEMPORARY_REDIRECT]: 'Temporary Redirect',
  [HttpStatus.PERMANENT_REDIRECT]: 'Permanent Redirect',

  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.PAYMENT_REQUIRED]: 'Payment Required',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
  [HttpStatus.NOT_ACCEPTABLE]: 'Not Acceptable',
  [HttpStatus.PROXY_AUTHENTICATION_REQUIRED]: 'Proxy Authentication Required',
  [HttpStatus.REQUEST_TIMEOUT]: 'Request Timeout',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.GONE]: 'Gone',
  [HttpStatus.LENGTH_REQUIRED]: 'Length Required',
  [HttpStatus.PRECONDITION_FAILED]: 'Precondition Failed',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'Payload Too Large',
  [HttpStatus.URI_TOO_LONG]: 'URI Too Long',
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: 'Unsupported Media Type',
  [HttpStatus.RANGE_NOT_SATISFIABLE]: 'Range Not Satisfiable',
  [HttpStatus.EXPECTATION_FAILED]: 'Expectation Failed',
  [HttpStatus.IM_A_TEAPOT]: "I'm a teapot",
  [HttpStatus.MISDIRECTED_REQUEST]: 'Misdirected Request',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
  [HttpStatus.LOCKED]: 'Locked',
  [HttpStatus.FAILED_DEPENDENCY]: 'Failed Dependency',
  [HttpStatus.TOO_EARLY]: 'Too Early',
  [HttpStatus.UPGRADE_REQUIRED]: 'Upgrade Required',
  [HttpStatus.PRECONDITION_REQUIRED]: 'Precondition Required',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
  [HttpStatus.REQUEST_HEADER_FIELDS_TOO_LARGE]: 'Request Header Fields Too Large',
  [HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS]: 'Unavailable For Legal Reasons',

  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
  [HttpStatus.NOT_IMPLEMENTED]: 'Not Implemented',
  [HttpStatus.BAD_GATEWAY]: 'Bad Gateway',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
  [HttpStatus.GATEWAY_TIMEOUT]: 'Gateway Timeout',
  [HttpStatus.HTTP_VERSION_NOT_SUPPORTED]: 'HTTP Version Not Supported',
  [HttpStatus.VARIANT_ALSO_NEGOTIATES]: 'Variant Also Negotiates',
  [HttpStatus.INSUFFICIENT_STORAGE]: 'Insufficient Storage',
  [HttpStatus.LOOP_DETECTED]: 'Loop Detected',
  [HttpStatus.NOT_EXTENDED]: 'Not Extended',
  [HttpStatus.NETWORK_AUTHENTICATION_REQUIRED]: 'Network Authentication Required',
};

/**
 * Returns the standard reason phrase for a given HTTP status code.
 *
 * @description Looks up the canonical RFC status text corresponding to the numeric code.
 * If the code is unknown, returns "Unknown Status".
 *
 * @param {number} statusCode - Numeric HTTP status code.
 * @returns {string} Canonical HTTP reason phrase.
 */
export function getHttpStatusPhrase(statusCode: number): string {
  return HttpStatusPhrase[statusCode as HttpStatusCode] ?? 'Unknown Status';
}

/**
 * Checks whether an HTTP status code represents a successful response (2xx).
 *
 * @description Evaluates if the status code is within the [200, 299] range.
 *
 * @param {number} statusCode - The status code to test.
 * @returns {boolean} True if the status code is 2xx.
 */
export function isSuccess(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 300;
}

/**
 * Checks whether an HTTP status code represents a redirection response (3xx).
 *
 * @description Evaluates if the status code is within the [300, 399] range.
 *
 * @param {number} statusCode - The status code to test.
 * @returns {boolean} True if the status code is 3xx.
 */
export function isRedirect(statusCode: number): boolean {
  return statusCode >= 300 && statusCode < 400;
}

/**
 * Checks whether an HTTP status code represents a client error (4xx).
 *
 * @description Evaluates if the status code is within the [400, 499] range.
 *
 * @param {number} statusCode - The status code to test.
 * @returns {boolean} True if the status code is 4xx.
 */
export function isClientError(statusCode: number): boolean {
  return statusCode >= 400 && statusCode < 500;
}

/**
 * Checks whether an HTTP status code represents a server error (5xx).
 *
 * @description Evaluates if the status code is within the [500, 599] range.
 *
 * @param {number} statusCode - The status code to test.
 * @returns {boolean} True if the status code is 5xx.
 */
export function isServerError(statusCode: number): boolean {
  return statusCode >= 500 && statusCode < 600;
}

/**
 * Checks whether an HTTP status code represents an error response (4xx or 5xx).
 *
 * @description Evaluates if the status code is >= 400.
 *
 * @param {number} statusCode - The status code to test.
 * @returns {boolean} True if the status code is an error.
 */
export function isErrorStatus(statusCode: number): boolean {
  return statusCode >= 400;
}
