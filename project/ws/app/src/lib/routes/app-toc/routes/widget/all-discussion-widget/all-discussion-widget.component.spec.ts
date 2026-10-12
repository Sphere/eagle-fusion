import { ConfigService, EventsService, NavigationServiceService, DiscussionService } from '@aastrika_npmjs/discussions-ui-v8'
import { AllDiscussionWidgetComponent } from './all-discussion-widget.component'

const mockConfigSvc: Partial<ConfigService> = {}
const mockDiscussionService: Partial<DiscussionService> = {}
const mockNavigationServiceService: Partial<NavigationServiceService> = {}
const mockEventService: Partial<EventsService> = {}

function createComponent(): AllDiscussionWidgetComponent {
  return new AllDiscussionWidgetComponent(
    mockConfigSvc as ConfigService,
    mockDiscussionService as DiscussionService,
    mockNavigationServiceService as NavigationServiceService,
    mockEventService as EventsService,
  )
}

describe('AllDiscussionWidgetComponent', () => {
  let component: AllDiscussionWidgetComponent

  beforeEach(() => {
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set state to alldiscussPage on wrapperInit', () => {
    component.state = 'other'
    component.wrapperInit()
    expect(component.state).toBe(component.alldiscussPage)
  })

  it('should reset state and showTrendTagPost on widgetBackClick', () => {
    component.state = 'other'
    component.showTrendTagPost = 5
    component.widgetBackClick()
    expect(component.state).toBe(component.alldiscussPage)
    expect(component.showTrendTagPost).toBe(0)
  })

  it('should set tid, slug and showTrendTagPost for detailsPage action', () => {
    component.stateChange({ action: component.detailsPage, tid: 12, title: 'my-title' })
    expect(component.previousState).toBe(component.alldiscussPage)
    expect(component.state).toBe(component.detailsPage)
    expect(component.tid).toBe(12)
    expect(component.slug).toBe('my-title')
    expect(component.showTrendTagPost).toBe(0)
  })

  it('should set tid, slug, showTrendTagPost and cIds for tagAllDiscussPage action', () => {
    component.stateChange({ action: component.tagAllDiscussPage, tid: 34, title: 'tag-title', cIds: ['1', '2'] })
    expect(component.state).toBe(component.tagAllDiscussPage)
    expect(component.tid).toBe(34)
    expect(component.slug).toBe('tag-title')
    expect(component.showTrendTagPost).toBe(1)
    expect(component.cIds.result).toEqual(['1', '2'])
  })

  it('should just update state for unrelated actions', () => {
    component.stateChange({ action: 'randomAction' })
    expect(component.state).toBe('randomAction')
  })
})
