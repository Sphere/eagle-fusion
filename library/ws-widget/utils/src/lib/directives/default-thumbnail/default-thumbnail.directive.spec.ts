import { DefaultThumbnailDirective } from './default-thumbnail.directive'

describe('DefaultThumbnailDirective', () => {
  let directive: DefaultThumbnailDirective

  beforeEach(() => {
    directive = new DefaultThumbnailDirective()
  })

  it('should create with empty defaults', () => {
    expect(directive).toBeTruthy()
    expect(directive.wsUtilsDefaultThumbnail).toBe('')
    expect(directive.src).toBe('')
    expect(directive.srcUrl).toBe('')
    expect(directive.isSrcUpdateAttemptedForDefault).toBe(false)
  })

  describe('ngOnChanges', () => {
    it('should bind the incoming src', () => {
      directive.src = 'real.png'
      directive.ngOnChanges()
      expect(directive.srcUrl).toBe('real.png')
    })

    it('should leave the bound src alone when the input is empty', () => {
      directive.srcUrl = 'existing.png'
      directive.src = ''
      directive.ngOnChanges()
      expect(directive.srcUrl).toBe('existing.png')
    })
  })

  describe('error fallback', () => {
    it('should swap in the default thumbnail on the first error', () => {
      directive.wsUtilsDefaultThumbnail = 'fallback.png'
      directive.src = 'broken.png'
      directive.ngOnChanges()

      directive.updateSrc()
      expect(directive.srcUrl).toBe('fallback.png')
      expect(directive.isSrcUpdateAttemptedForDefault).toBe(true)
    })

    it('should not retry the fallback if it also fails', () => {
      directive.wsUtilsDefaultThumbnail = 'fallback.png'
      directive.updateSrc()
      directive.srcUrl = 'something-else.png'
      directive.updateSrc()
      expect(directive.srcUrl).toBe('something-else.png')
    })
  })
})
