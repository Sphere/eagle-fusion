import { CKEditorResolverService } from './ckeditor-resolve.service'

describe('CKEditorResolverService', () => {
  let service: CKEditorResolverService

  beforeEach(() => {
    service = new CKEditorResolverService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should append script and emit true on load', done => {
    service.inject().subscribe(result => {
      expect(result).toBe(true)
      const scripts = document.getElementsByTagName('script')
      const injected = Array.from(scripts).find(s => s.src.includes('ckeditor.js'))
      expect(injected).toBeTruthy()
      done()
    })

    const scripts = document.getElementsByTagName('script')
    const scriptElement = Array.from(scripts).find(s => s.src.includes('ckeditor.js')) as HTMLScriptElement
    expect(scriptElement).toBeTruthy();
    (scriptElement.onload as any)()
  })

  it('should emit error when script fails to load', done => {
    service.inject().subscribe({
      next: () => fail('should not emit next'),
      error: (err: any) => {
        expect(err).toBe(false)
        done()
      },
    })

    const scripts = document.getElementsByTagName('script')
    const scriptElement = Array.from(scripts).find(s => s.src.includes('ckeditor.js')) as HTMLScriptElement
    expect(scriptElement).toBeTruthy();
    (scriptElement.onerror as any)()
  })

  it('should emit true immediately without appending a new script when already loaded', () => {
    (service as any).isExist = true
    const appendSpy = jest.spyOn(document.body, 'appendChild')
    let result: boolean | undefined
    service.inject().subscribe(res => { result = res })
    expect(result).toBe(true)
    expect(appendSpy).not.toHaveBeenCalled()
    appendSpy.mockRestore()
  })
})
