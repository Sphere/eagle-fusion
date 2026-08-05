import { PipeHtmlTagRemovalPipe } from './pipe-html-tag-removal.pipe'

describe('PipeHtmlTagRemovalPipe', () => {
  let pipe: PipeHtmlTagRemovalPipe

  beforeEach(() => {
    pipe = new PipeHtmlTagRemovalPipe()
  })

  it('should create', () => {
    expect(pipe).toBeTruthy()
  })

  it('should return an empty string for falsy input', () => {
    expect(pipe.transform('')).toBe('')
    expect(pipe.transform(null as any)).toBe('')
    expect(pipe.transform(undefined as any)).toBe('')
  })

  it('should strip html tags but keep the text content', () => {
    expect(pipe.transform('<p>hello</p>')).toBe('hello')
    expect(pipe.transform('<div class="a"><b>bold</b> text</div>')).toBe('bold text')
  })

  it('should strip tags spanning multiple lines', () => {
    expect(pipe.transform('<p>line one</p>\n<p>line two</p>')).toBe('line one\nline two')
  })

  it('should leave plain text untouched', () => {
    expect(pipe.transform('no tags here')).toBe('no tags here')
  })

  it('should coerce non-string input via String()', () => {
    expect(pipe.transform(42 as any)).toBe('42')
  })
})
