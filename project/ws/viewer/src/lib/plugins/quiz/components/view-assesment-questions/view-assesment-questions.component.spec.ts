import { jsPlumb } from 'jsplumb'
import { ViewAssesmentQuestionsComponent } from './view-assesment-questions.component'

jest.mock('jsplumb', () => ({ jsPlumb: { getInstance: jest.fn() } }))

/**
 * Regression: MTF connectors were appended to document.body (no jsPlumb Container), so when an MTF
 * was the last question its lines stayed painted over the result tab after submit.
 */
describe('ViewAssesmentQuestionsComponent (MTF jsPlumb)', () => {
  let component: ViewAssesmentQuestionsComponent
  let host: HTMLElement
  let instance: any

  beforeEach(() => {
    instance = {
      bind: jest.fn(),
      getSelector: jest.fn().mockReturnValue([]),
      deleteEveryConnection: jest.fn(),
      unmakeEverySource: jest.fn(),
      unmakeEveryTarget: jest.fn(),
      reset: jest.fn(),
    }
    ;(jsPlumb.getInstance as jest.Mock).mockReset().mockReturnValue(instance)
    host = document.createElement('div')
    host.innerHTML = '<div id="do_114"></div>'
    component = new ViewAssesmentQuestionsComponent({} as any, { nativeElement: host } as any, {} as any)
    component.question = { questionId: 'do_114', questionType: 'mtf', options: [] } as any
  })

  it('anchors the connectors to the question container instead of document.body', () => {
    component.initJsPlump()

    expect(jsPlumb.getInstance).toHaveBeenCalledWith(expect.objectContaining({ Container: host.firstElementChild }))
  })

  it('omits Container when the question element is not rendered', () => {
    host.innerHTML = ''

    component.initJsPlump()

    expect((jsPlumb.getInstance as jest.Mock).mock.calls[0][0].Container).toBeUndefined()
  })

  it('removes connections and drag listeners on destroy', () => {
    component.initJsPlump()

    component.ngOnDestroy()

    expect(instance.deleteEveryConnection).toHaveBeenCalled()
    expect(instance.unmakeEverySource).toHaveBeenCalled()
    expect(instance.unmakeEveryTarget).toHaveBeenCalled()
    expect(instance.reset).toHaveBeenCalled()
  })

  it('does not throw on destroy when jsPlumb was never initialised', () => {
    expect(() => component.ngOnDestroy()).not.toThrow()
  })
})
