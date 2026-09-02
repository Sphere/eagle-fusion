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
import { YoutubeComponent } from './youtube.component'

describe('YoutubeComponent (route-view-container)', () => {
  let component: YoutubeComponent
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
    component = new YoutubeComponent(mockActivatedRoute, mockConfigSvc, mockViewerDataSvc)
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

  it('should set isTypeOfCollection and collectionIdentifier', () => {
    component.ngOnInit()
    expect(component.isTypeOfCollection).toBe(true)
    expect(component.collectionIdentifier).toBe('coll-1')
  })

  it('should update prev/next titles and resource urls from playerState', () => {
    component.ngOnInit()
    playerStateSubject.next({
      previousTitle: 'Prev',
      nextResTitle: 'Next',
      prevResource: 'prev-url',
      nextResource: 'next-url',
    })
    expect(component.prevTitle).toBe('Prev')
    expect(component.nextTitle).toBe('Next')
    expect(component.prevResourceUrl).toBe('prev-url')
    expect(component.nextResourceUrl).toBe('next-url')
  })
})
