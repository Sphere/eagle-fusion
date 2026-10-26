import { AfterViewInit, Component, ElementRef } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { DomSanitizer } from '@angular/platform-browser'
import { FitbQuestionHtml, SafeResourceUrlService } from '../../../../../../../../library/ws-widget/utils/src/lib/services/safe-resource-url.service'
import { FitbBlanksDirective } from './fitb-blanks.directive'

@Component({
  standalone: false,
  template: '<h3 [innerHTML]="fitb?.html" [wsFitbBlanks]="fitb"></h3>',
})
class HostComponent implements AfterViewInit {
  fitb: FitbQuestionHtml | null = null
  idsSeenInAfterViewInit: string[] = []

  constructor(public elementRef: ElementRef<HTMLElement>) { }

  ngAfterViewInit() {
    // Mirrors the quiz components, which attach change listeners to the blanks here.
    this.idsSeenInAfterViewInit = Array.from(this.elementRef.nativeElement.querySelectorAll('input')).map(i => i.id)
  }
}

describe('FitbBlanksDirective', () => {
  let service: SafeResourceUrlService
  // Angular logs a dev-mode warning whenever it strips content; these tests strip on purpose.
  let warnSpy: jest.SpyInstance

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    TestBed.configureTestingModule({ declarations: [HostComponent, FitbBlanksDirective] })
    service = new SafeResourceUrlService(TestBed.inject(DomSanitizer))
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  const createHost = (question: string) => {
    const fixture = TestBed.createComponent(HostComponent)
    fixture.componentInstance.fitb = service.sanitizeFitbHtml(question)
    fixture.detectChanges()
    return fixture
  }

  it('should render the blanks before the host component\'s ngAfterViewInit runs', () => {
    const fixture = createHost('<p>Heart has <input type="text" id="q10"> chambers and <input type="text" id="q11"> valves</p>')
    expect(fixture.componentInstance.idsSeenInAfterViewInit).toEqual(['q10', 'q11'])
  })

  it('should create text inputs with the blank styling inside the author markup', () => {
    const fixture = createHost('<p>Heart has <input id="q10"> chambers</p>')
    const h3: HTMLElement = fixture.nativeElement.querySelector('h3')
    const input = h3.querySelector('p > input') as HTMLInputElement
    expect(input.type).toBe('text')
    expect(input.hasAttribute('matinput')).toBe(true)
    expect(input.getAttribute('style')).toBe('border-style: none none solid none; border-width: 1px; padding: 8px 12px;')
    expect(h3.textContent).toBe('Heart has  chambers')
  })

  it('should keep values typed into a blank across later change detection', () => {
    const fixture = createHost('<p><input id="q0"></p>')
    const input = fixture.nativeElement.querySelector('#q0') as HTMLInputElement
    input.value = 'four'
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('#q0')).toBe(input)
    expect(input.value).toBe('four')
  })

  it('should render the new blanks when the question changes', () => {
    const fixture = createHost('<p><input id="q0"></p>')
    fixture.componentInstance.fitb = service.sanitizeFitbHtml('<p><input id="q20"> and <input id="q21"></p>')
    fixture.componentRef.changeDetectorRef.markForCheck()
    fixture.detectChanges()
    const ids = Array.from(fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>).map(i => i.id)
    expect(ids).toEqual(['q20', 'q21'])
  })

  it('should not render script from the question', () => {
    const fixture = createHost('<p>Q <input id="q0"><script>window.__fitbXss = 1</script><img src="x" onerror="window.__fitbXss = 1"></p>')
    const h3: HTMLElement = fixture.nativeElement.querySelector('h3')
    expect(h3.querySelector('script')).toBeNull()
    expect(h3.querySelector('[onerror]')).toBeNull()
    expect((window as any).__fitbXss).toBeUndefined()
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('sanitizing HTML stripped some content'))
  })

  it('should do nothing without a question', () => {
    const fixture = TestBed.createComponent(HostComponent)
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('input')).toBeNull()
  })
})
