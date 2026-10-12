import { TestBed } from '@angular/core/testing'
import { Subject, of } from 'rxjs'
import { ViewAllComponent } from './view-all.component'

let queryParams$: Subject<any>

const mockRoute: any = {
  get queryParams() {
    return queryParams$.asObservable()
  },
}

const mockValueSvc: any = {
  isMobile: jest.fn().mockReturnValue(false),
}

const mockConfigSvc: any = {
  userProfile: { rootOrgId: 'org1' },
}

const mockPlaylistSvc: any = {
  getPlaylistConfig: jest.fn().mockResolvedValue([]),
  getPlaylistConfigId: jest.fn((sectionId: string) => sectionId),
}

const mockLangSvc: any = {
  getCurrentLanguage: jest.fn().mockReturnValue('en'),
}

const mockOrgSvc: any = {
  getTopLiveSearchResults: jest.fn().mockReturnValue(of({ result: { content: [] } })),
}

const mockLogger: any = {
  log: jest.fn(),
}

function createComponent(): ViewAllComponent {
  return TestBed.runInInjectionContext(() => new ViewAllComponent(
    mockOrgSvc,
    mockValueSvc,
    mockRoute,
    mockConfigSvc,
    mockPlaylistSvc,
    mockLangSvc,
    mockLogger,
  ))
}

describe('ViewAllComponent', () => {
  let component: ViewAllComponent

  beforeEach(() => {
    jest.clearAllMocks()
    queryParams$ = new Subject<any>()
    mockConfigSvc.userProfile = { rootOrgId: 'org1' }
    mockPlaylistSvc.getPlaylistConfig.mockResolvedValue([])
    mockOrgSvc.getTopLiveSearchResults.mockReturnValue(of({ result: { content: [] } }))
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('effect should set isXSmall$ from valueSvc.isMobile', () => {
    expect(component.isXSmall$()).toBe(false)
  })

  it('contentTrackBy should return identifier', () => {
    expect(component.contentTrackBy({ identifier: 'abc' })).toBe('abc')
  })

  describe('ngOnInit', () => {
    it('should set courseType default and identifiers empty when no params', async () => {
      component.ngOnInit()
      queryParams$.next({})
      await Promise.resolve()
      await Promise.resolve()
      expect(component.courseType()).toBe('defaultCourseType')
      expect(component.identifiers()).toEqual([])
      expect(component.searchRequestStatus()).toBe('done')
    })

    it('should set courseType from params and identifiers as array', async () => {
      component.ngOnInit()
      queryParams$.next({ courseType: 'topCourse', data: ['a', 'b'] })
      await Promise.resolve()
      await Promise.resolve()
      expect(component.courseType()).toBe('topCourse')
      expect(component.identifiers()).toEqual(['a', 'b'])
    })

    it('should wrap single data param into array', async () => {
      component.ngOnInit()
      queryParams$.next({ data: 'single' })
      await Promise.resolve()
      await Promise.resolve()
      expect(component.identifiers()).toEqual(['single'])
    })

    it('should fetch playlist config when rootOrgId present', async () => {
      component.ngOnInit()
      queryParams$.next({})
      await Promise.resolve()
      await Promise.resolve()
      expect(mockPlaylistSvc.getPlaylistConfig).toHaveBeenCalled()
    })

    it('should not fetch playlist config when no rootOrgId', async () => {
      mockConfigSvc.userProfile = {}
      component.ngOnInit()
      queryParams$.next({})
      await Promise.resolve()
      await Promise.resolve()
      expect(mockPlaylistSvc.getPlaylistConfig).not.toHaveBeenCalled()
    })
  })

  describe('fetchEnvironmentConfigurations', () => {
    it('should set done status when no plyLsData', () => {
      component.plyLsData = undefined
      component.fetchEnvironmentConfigurations()
      expect(component.searchRequestStatus()).toBe('done')
    })

    it('should collect topCourse identifiers and call formatTopCertifiedCourseResponse on results', () => {
      component.courseType.set('topCourse')
      component.plyLsData = [
        { orgId: 'org1', language: 'en', playlistId: 'TOP_COURSE_PLAYLIST', dataSource: { payload: ['id1'] } },
      ]
      mockOrgSvc.getTopLiveSearchResults.mockReturnValue(of({ result: { content: [{ identifier: 'id1' }] } }))
      component.fetchEnvironmentConfigurations()
      expect(component.topCertifiedCourseIdentifier()).toEqual(['id1'])
      expect(component.searchResults()).toEqual([{ identifier: 'id1' }])
      expect(component.searchRequestStatus()).toBe('done')
    })

    it('should collect cneCourses identifiers and call formatcneCourseResponse on results', () => {
      component.courseType.set('cneCourses')
      component.plyLsData = [
        { orgId: 'org1', language: 'en', playlistId: 'CNE_COURSE_PLAYLIST', dataSource: { payload: ['id2'] } },
      ]
      mockOrgSvc.getTopLiveSearchResults.mockReturnValue(of({ result: { content: [{ identifier: 'id2' }] } }))
      component.fetchEnvironmentConfigurations()
      expect(component.cneCoursesIdentifier()).toEqual(['id2'])
      expect(component.searchResults()).toEqual([{ identifier: 'id2' }])
    })

    it('should skip elements not matching orgId or language', () => {
      component.courseType.set('topCourse')
      component.plyLsData = [
        { orgId: 'other', language: 'en', playlistId: 'TOP_COURSE_PLAYLIST', dataSource: { payload: ['id1'] } },
      ]
      component.fetchEnvironmentConfigurations()
      expect(component.searchRequestStatus()).toBe('done')
    })

    it('should not process content when result content empty', () => {
      component.courseType.set('topCourse')
      component.plyLsData = [
        { orgId: 'org1', language: 'en', playlistId: 'TOP_COURSE_PLAYLIST', dataSource: { payload: ['id1'] } },
      ]
      mockOrgSvc.getTopLiveSearchResults.mockReturnValue(of({ result: { content: [] } }))
      component.fetchEnvironmentConfigurations()
      expect(component.searchRequestStatus()).toBe('done')
    })

    it('should use identifiers() fallback path when no rootOrgId and identifiers present for topCourse', () => {
      mockConfigSvc.userProfile = {}
      component.courseType.set('topCourse')
      component.identifiers.set(['idX'])
      component.plyLsData = []
      mockOrgSvc.getTopLiveSearchResults.mockReturnValue(of({ result: { content: [{ identifier: 'idX' }] } }))
      component.fetchEnvironmentConfigurations()
      expect(component.topCertifiedCourseIdentifier()).toEqual(['idX'])
      expect(component.searchResults()).toEqual([{ identifier: 'idX' }])
    })

    it('should use identifiers() fallback path for cneCourses', () => {
      mockConfigSvc.userProfile = {}
      component.courseType.set('cneCourses')
      component.identifiers.set(['idY'])
      component.plyLsData = []
      mockOrgSvc.getTopLiveSearchResults.mockReturnValue(of({ result: { content: [{ identifier: 'idY' }] } }))
      component.fetchEnvironmentConfigurations()
      expect(component.cneCoursesIdentifier()).toEqual(['idY'])
      expect(component.searchResults()).toEqual([{ identifier: 'idY' }])
    })

    it('should set done and not call orgSvc when no identifiers and no rootOrgId', () => {
      mockConfigSvc.userProfile = {}
      component.identifiers.set([])
      component.plyLsData = []
      mockOrgSvc.getTopLiveSearchResults.mockClear()
      component.fetchEnvironmentConfigurations()
      expect(mockOrgSvc.getTopLiveSearchResults).not.toHaveBeenCalled()
      expect(component.searchRequestStatus()).toBe('done')
    })
  })

  describe('formatTopCertifiedCourseResponse', () => {
    it('should filter and dedupe content matching topCertifiedCourseIdentifier', () => {
      component.topCertifiedCourseIdentifier.set(['id1'])
      component.formatTopCertifiedCourseResponse({
        result: { content: [{ identifier: 'id1' }, { identifier: 'id2' }, { identifier: 'id1' }] },
      })
      expect(component.searchResults()).toEqual([{ identifier: 'id1' }])
    })
  })

  describe('formatcneCourseResponse', () => {
    it('should filter and dedupe content matching cneCoursesIdentifier', () => {
      component.cneCoursesIdentifier.set(['id2'])
      component.formatcneCourseResponse({
        result: { content: [{ identifier: 'id2' }, { identifier: 'id3' }] },
      })
      expect(component.searchResults()).toEqual([{ identifier: 'id2' }])
    })
  })
})
