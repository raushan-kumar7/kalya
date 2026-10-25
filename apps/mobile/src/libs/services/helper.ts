/**
 * Encodes an object of key-value parameters into an HTTP query string.
 *
 * @description Filters out undefined, null, and empty string values to produce a clean query string.
 * Prepend a '?' prefix if query parameters exist, or returns an empty string if none are valid.
 * @param {Record<string, unknown>} [params] - Key-value map of parameter names and values.
 * @returns {string} Formatted query string with leading '?' or empty string.
 * @example
 * buildQueryString({ q: 'john', limit: 10, filter: undefined }); // "?q=john&limit=10"
 * buildQueryString(); // ""
 */
export const buildQueryString = (params?: Record<string, unknown>): string => {
  if (!params) return '';

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
};
