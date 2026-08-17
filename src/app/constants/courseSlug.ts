/**
 * Canonical course-URL slug.
 *
 * MUST stay in sync with `slugify()` in `generate-sitemap.js` at the repo root —
 * that script writes sitemap.xml and prerender-routes.txt, this one writes the
 * `<link rel="canonical">`. If the two disagree, the sitemap advertises one URL
 * while the page canonicalises to another and Google indexes neither reliably.
 *
 * The slug is decorative: the route matches on the content identifier, so every
 * slug variant of a course resolves with a 200. That is exactly why the canonical
 * has to be derived from the course name rather than from the current URL —
 * otherwise each stale slug self-canonicalises and competes with the real one.
 */

// Devanagari -> Latin, enough for readable keyword slugs (not scholarly IAST).
const DEVANAGARI_VOWELS: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'ॲ': 'a', 'ऑ': 'o',
}
const DEVANAGARI_MATRAS: Record<string, string> = {
  'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ॉ': 'o', 'ॅ': 'a',
}
const DEVANAGARI_CONSONANTS: Record<string, string> = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'ळ': 'l', 'व': 'v',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क़': 'q', 'ख़': 'kh', 'ग़': 'g', 'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f',
}
const NASALS: Record<string, string> = { 'ं': 'n', 'ँ': 'n', 'ः': 'h' }
const HALANT = '्'

const MAX_SLUG_LENGTH = 80

function transliterateDevanagari(text: string): string {
  let out = ''
  let pendingInherentA = false

  for (const ch of text) {
    if (DEVANAGARI_CONSONANTS[ch]) {
      if (pendingInherentA) { out += 'a' }
      out += DEVANAGARI_CONSONANTS[ch]
      pendingInherentA = true
    } else if (DEVANAGARI_MATRAS[ch]) {
      out += DEVANAGARI_MATRAS[ch]
      pendingInherentA = false
    } else if (ch === HALANT) {
      pendingInherentA = false
    } else if (DEVANAGARI_VOWELS[ch]) {
      if (pendingInherentA) { out += 'a' }
      out += DEVANAGARI_VOWELS[ch]
      pendingInherentA = false
    } else if (NASALS[ch]) {
      if (pendingInherentA) { out += 'a' }
      out += NASALS[ch]
      pendingInherentA = false
    } else if (ch === '़') {
      // bare nukta — already folded into the consonant map where it matters
    } else {
      // Word boundary: Hindi deletes the word-final inherent vowel (schwa deletion).
      pendingInherentA = false
      out += ch
    }
  }

  return out
}

export function courseSlug(name: string): string {
  const slug = transliterateDevanagari(name || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (slug.length <= MAX_SLUG_LENGTH) { return slug }
  const cut = slug.slice(0, MAX_SLUG_LENGTH)
  const lastDash = cut.lastIndexOf('-')
  return (lastDash > 0 ? cut.slice(0, lastDash) : cut).replace(/-+$/, '')
}

/** Absolute canonical URL for a course overview page, trailing slash included. */
export function courseCanonicalUrl(identifier: string, name: string): string {
  const slug = courseSlug(name) || identifier
  return `https://sphere.aastrika.org/public/toc/overview/${identifier}/${slug}/`
}
