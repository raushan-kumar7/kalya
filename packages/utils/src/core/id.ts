import { customAlphabet } from 'nanoid';

/**
 * The alphabet used for ID generation, omitting visually ambiguous characters.
 */
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/**
 * The default length for generated IDs.
 */
const DEFAULT_LENGTH = 21;

/**
 * The minimum allowed length for generated IDs to ensure collision resistance.
 */
const MIN_LENGTH = 8;

/**
 * A cache to store and reuse ID generators for specific lengths.
 */
const generatorCache = new Map<number, () => string>();

/**
 * Retrieves an ID generator for a specific length, creating and caching it if necessary.
 *
 * @param length The length of the ID the generator should produce.
 * @returns A function that generates an ID string.
 */
function getGenerator(length: number): () => string {
  let generator = generatorCache.get(length);
  if (!generator) {
    generator = customAlphabet(ALPHABET, length);
    generatorCache.set(length, generator);
  }
  return generator;
}

/**
 * Generates a collision-resistant, URL-safe unique ID.
 *
 * @param length The length of the ID to generate (must be >= 8). Defaults to 21.
 * @returns A unique string ID.
 */
export function generateId(length: number = DEFAULT_LENGTH): string {
  if (!Number.isInteger(length) || length < MIN_LENGTH) {
    throw new Error(`generateId: length must be an integer >= ${MIN_LENGTH}, got ${length}`);
  }
  return getGenerator(length)();
}
