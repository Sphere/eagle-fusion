/* eslint-disable @typescript-eslint/no-var-requires */
// Unit tests for the build-time sitemap/prerender-routes generator. We exercise the pure
// URL-building helpers (slugify, coursePath) — the network + file I/O in main() is guarded
// behind `require.main === module` so requiring the module here does not trigger it.
const { slugify, truncateSlug, coursePath, MAX_SLUG_BYTES } = require('./generate-sitemap')

describe('generate-sitemap slug helpers', () => {
  describe('slugify', () => {
    it('lowercases and hyphenates a Latin title', () => {
      expect(slugify('Care of Sick Newborn')).toBe('care-of-sick-newborn')
    })

    it('expands & to "and"', () => {
      expect(slugify('Hypertension in Pregnancy & AMTSL')).toBe('hypertension-in-pregnancy-and-amtsl')
    })

    it('collapses repeated separators and trims edge hyphens', () => {
      expect(slugify('  Post-partum   Haemorrhage (PPH)!  ')).toBe('post-partum-haemorrhage-pph')
    })

    it('keeps Devanagari letters and matras intact instead of stripping them', () => {
      // Regression: [^a-z0-9] wiped Devanagari to '', causing the /<id>/<id> duplication.
      expect(slugify('सक्रिय प्रबंधन')).toBe('सक्रिय-प्रबंधन')
      expect(slugify('नवजात शिशु की देखभाल')).toBe('नवजात-शिशु-की-देखभाल')
    })

    it('returns empty string for a title with no sluggable characters', () => {
      expect(slugify('!!! --- @#')).toBe('')
    })
  })

  describe('truncateSlug', () => {
    const bytes = (s: string) => Buffer.byteLength(s, 'utf8')

    it('leaves a short slug unchanged', () => {
      expect(truncateSlug('care-of-sick-newborn')).toBe('care-of-sick-newborn')
    })

    it('caps a long Devanagari slug under the byte limit, on a word boundary', () => {
      // Real-world longest title from the sitemap (261 bytes) — exceeds the 255-byte folder limit.
      const long = slugify('गर्भवती महिला को परामर्श देने और संस्थागत प्रसव हेतु उसे प्रोत्साहित करने के लिए उसके घर विजिट करना')
      const result = truncateSlug(long)
      expect(bytes(long)).toBeGreaterThan(MAX_SLUG_BYTES)
      expect(bytes(result)).toBeLessThanOrEqual(MAX_SLUG_BYTES)
      expect(result.endsWith('-')).toBe(false)
      // Truncation happens on a hyphen boundary, so the result is a prefix of the full slug's words.
      expect(long.startsWith(result)).toBe(true)
    })

    it('never leaves a trailing hyphen', () => {
      const result = truncateSlug(slugify('a'.repeat(60) + ' ' + 'b'.repeat(200)))
      expect(result.endsWith('-')).toBe(false)
    })

    it('keeps the resulting slug a valid path segment well under the 255-byte filesystem limit', () => {
      const long = slugify('संक्रमण की रोकथाम एवं नियंत्रण के लिए स्वास्थ्य कार्यकर्ता हेतु विस्तृत प्रशिक्षण मॉड्यूल पाठ्यक्रम')
      expect(bytes(truncateSlug(long))).toBeLessThan(255)
    })
  })

  describe('coursePath', () => {
    it('builds a readable two-segment course path', () => {
      expect(coursePath({ identifier: 'do_123', name: 'Care of Sick Newborn' }))
        .toBe('/public/toc/overview/do_123/care-of-sick-newborn')
    })

    it('never repeats the identifier as the slug — falls back to "course"', () => {
      // Regression guard for the /public/toc/overview/<id>/<id> URLs (38% of the sitemap).
      expect(coursePath({ identifier: 'do_999', name: '!!! --- @#' }))
        .toBe('/public/toc/overview/do_999/course')
    })

    it('produces a readable Devanagari slug for a Hindi course', () => {
      expect(coursePath({ identifier: 'do_456', name: 'सक्रिय प्रबंधन' }))
        .toBe('/public/toc/overview/do_456/सक्रिय-प्रबंधन')
    })
  })
})
