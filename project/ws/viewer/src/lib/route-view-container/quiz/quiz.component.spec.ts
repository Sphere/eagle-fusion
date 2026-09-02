jest.mock('@ws-widget/collection', () => ({
  NsContent: {},
}))

import { of, Subject } from 'rxjs'
import { QuizComponent } from './quiz.component'

describe('QuizComponent (route-view-container)', () => {
  let component: QuizComponent
  let mockActivatedRoute: any
  let mockViewerDataSvc: any
  let mockValueSvc: any
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
    mockViewerDataSvc = {
      playerState: playerStateSubject.asObservable(),
    }
    mockValueSvc = {
      isXSmall$: of(false),
    }
    component = new QuizComponent(mockActivatedRoute, mockViewerDataSvc, mockValueSvc)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set isSmall from valueSvc.isXSmall$ in ngOnInit', () => {
    mockValueSvc.isXSmall$ = of(true)
    const comp = new QuizComponent(mockActivatedRoute, mockViewerDataSvc, mockValueSvc)
    comp.ngOnInit()
    expect(comp.isSmall).toBe(true)
  })

  it('should set isTypeOfCollection and collectionId when collectionType present', () => {
    component.ngOnInit()
    expect(component.isTypeOfCollection).toBe(true)
    expect(component.collectionId).toBe('coll-1')
    expect(component.collectionType).toBe('course')
    expect(component.collectionIdentifier).toBe('coll-1')
  })

  it('should not set collectionId when collectionType absent', () => {
    mockActivatedRoute.snapshot.queryParams = { collectionId: 'coll-2' }
    component = new QuizComponent(mockActivatedRoute, mockViewerDataSvc, mockValueSvc)
    component.ngOnInit()
    expect(component.isTypeOfCollection).toBe(false)
    expect(component.collectionId).toBeNull()
  })

  it('should update prevTitle and nextTitle from playerState subscription', () => {
    component.ngOnInit()
    playerStateSubject.next({ previousTitle: 'Prev', nextResTitle: 'Next' })
    expect(component.prevTitle).toBe('Prev')
    expect(component.nextTitle).toBe('Next')
  })
})
