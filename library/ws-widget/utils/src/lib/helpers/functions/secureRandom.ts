/**
 * Cryptographically strong replacements for Math.random(), backed by the Web Crypto API
 * (`crypto.getRandomValues`). `globalThis.crypto` is available in the browser, in web
 * workers and in Node 20, so the same helpers work everywhere this code runs.
 */

const UINT32_RANGE = 2 ** 32

/** A random float in [0, 1) — drop-in replacement for Math.random(). */
export function secureRandom(): number {
  const buffer = new Uint32Array(1)
  globalThis.crypto.getRandomValues(buffer)
  return buffer[0] / UINT32_RANGE
}

/**
 * A random integer in [0, max), taken straight from crypto.getRandomValues. Values from the
 * uneven tail of the 32-bit range are redrawn (rejection sampling), so every result is
 * equally likely. Returns 0 when max is less than 1.
 */
export function secureRandomInt(max: number): number {
  const bound = max - (max % 1)
  if (!(bound >= 1)) {
    return 0
  }
  const limit = UINT32_RANGE - (UINT32_RANGE % bound)
  const buffer = new Uint32Array(1)
  do {
    globalThis.crypto.getRandomValues(buffer)
  } while (buffer[0] >= limit)
  return buffer[0] % bound
}

/** A random lowercase base-36 string of the given length, for ids and DOM keys. */
export function secureRandomString(length = 8): string {
  return Array.from({ length }, () => secureRandomInt(36).toString(36)).join('')
}

/** Shuffles the array in place (Fisher–Yates) and returns it. */
export function secureShuffle<T>(array: T[]): T[] {
  for (let currentIndex = array.length - 1; currentIndex > 0; currentIndex -= 1) {
    const randomIndex = secureRandomInt(currentIndex + 1)
    const temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }
  return array
}
