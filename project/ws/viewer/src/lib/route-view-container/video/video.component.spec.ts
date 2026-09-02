jest.mock('@ws-widget/collection', () => ({
  NsContent: {},
  NsDiscussionForum: { EDiscussionType: { LEARNING: 'learning' } },
}))
jest.mock('@ws-widget/resolver', () => ({
  NsWidgetResolver: {},
}))
jest.mock('../../../../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {},
}))

import { Subject } from 'rxjs'
import { VideoComponent } from './video.component'

describe('VideoComponent (route-view-container)', () => {
  let component: VideoComponent
  let mockActivatedRoute: any
  let mockConfigSvc: any
  let mockViewerDataSvc: any
  let playerStateSubject: Subject<any>

  beforeEach(() => {
    playerStateSubject = new Subject()
    mockActivatedRoute = {
      snapshot: {
        queryParams: {
          collectionType: 'course',
          collectionId: 'coll-1',
        },
      },
    }
    mockConfigSvc = {
      restrictedFeatures: new Set(['someOtherFeature']),
    }
    mockViewerDataSvc = {
      playerState: playerStateSubject.asObservable(),
    }
    component = new VideoComponent(mockActivatedRoute, mockConfigSvc, mockViewerDataSvc)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set isRestricted true when restrictedFeatures does not have disscussionForum', () => {
    component.ngOnInit()
    expect(component.isRestricted).toBe(true)
  })

  it('should set isRestricted false when restrictedFeatures has disscussionForum', () => {
    mockConfigSvc.restrictedFeatures = new Set(['disscussionForum'])
    component.ngOnInit()
    expect(component.isRestricted).toBe(false)
  })

  it('should not touch isRestricted when restrictedFeatures is falsy', () => {
    mockConfigSvc.restrictedFeatures = null
    component.ngOnInit()
    expect(component.isRestricted).toBe(false)
  })

  it('should set isTypeOfCollection, collectionType and collectionIdentifier', () => {
    component.ngOnInit()
    expect(component.isTypeOfCollection).toBe(true)
    expect(component.collectionType).toBe('course')
    expect(component.collectionIdentifier).toBe('coll-1')
  })

  it('should update prevTitle, nextTitle and currentCompletionPercentage from playerState', () => {
    component.ngOnInit()
    playerStateSubject.next({ previousTitle: 'Prev', nextResTitle: 'Next', currentCompletionPercentage: 50 })
    expect(component.prevTitle).toBe('Prev')
    expect(component.nextTitle).toBe('Next')
    expect(component.currentCompletionPercentage).toBe(50)
  })
})
