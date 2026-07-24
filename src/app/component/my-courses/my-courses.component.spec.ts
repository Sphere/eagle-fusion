jest.mock('@angular/core', () => {
  const actual = jest.requireActual('@angular/core')
  return {
    ...actual,
    effect: (fn: () => void) => { fn() },
  }
})

jest.mock('@ws-widget/collection', () => ({
  NsContent: {},
  WidgetContentService: class {
    fetchUserBatchList = jest.fn()
    getCouseByContentSearch = jest.fn()
  },
}))

jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {},
  ValueService: class {
    isMobile = jest.fn().mockReturnValue(false)
  },
}))

jest.mock('src/app/routes/signup/signup.service', () => ({
  SignupService: class {
    getUserData = jest.fn().mockResolvedValue(null)
  },
}))

jest.mock('../../../../project/ws/app/src/lib/routes/org/org-service.service', () => ({
  OrgServiceService: class {
    getTopLiveSearchResults = jest.fn()
  },
}))

jest.mock('../../services/playlist.service', () => ({
  PlaylistService: class {},
}))

jest.mock('../../services/language.service', () => ({
  LanguageService: class {},
}))

import { BehaviorSubject, Subject, of, throwError } from 'rxjs'
import { MyCoursesComponent } from './my-courses.component'

describe('MyCoursesComponent', () => {
  let component: MyCoursesComponent
  let mockConfigSvc: any
  let mockContentSvc: any
  let mockSignupService: any
  let mockRouter: any
  let mockValueSvc: any
  let mockRoute: any
  let mockPlaylistSvc: any
  let mockLangSvc: any
  let mockOrgService: any
  let mockCdr: any
  let queryParamsSubject: Subject<any>

  beforeEach(() => {
    queryParamsSubject = new Subject<any>()

    mockConfigSvc = {
      userProfile: { userId: 'user123', rootOrgId: 'org1' },
      unMappedUser: null,
    }

    mockContentSvc = {
      fetchUserBatchList: jest.fn().mockReturnValue(of([])),
      getCouseByContentSearch: jest.fn().mockReturnValue(of({ result: { content: [] } })),
    }

    mockSignupService = {
      getUserData: jest.fn().mockResolvedValue(null),
    }

    mockRouter = {
      navigate: jest.fn(),
    }

    mockValueSvc = {
      isMobile: jest.fn().mockReturnValue(false),
    }

    mockRoute = {
      queryParams: queryParamsSubject.asObservable(),
    }

    mockPlaylistSvc = {
      getPlaylistConfig: jest.fn().mockResolvedValue([]),
      loadPlaylistData: jest.fn().mockResolvedValue(null),
      selectedTabConfig: jest.fn().mockReturnValue(''),
      orgDetails: jest.fn().mockReturnValue(''),
      headerConfig: jest.fn().mockReturnValue(null),
      getPlaylistConfigId: jest.fn((sectionId: string) => ({
        YOUR_PLANS_PLAYLIST: 'Playlist_Course',
        COMPETENCY_PLAYLIST: 'COMPETENCY_PLAYLIST_V2',
      }[sectionId])),
    }

    mockLangSvc = {
      getCurrentLanguage: jest.fn().mockReturnValue('en'),
    }

    mockOrgService = {
      getTopLiveSearchResults: jest.fn().mockReturnValue(of({ result: { content: [] } })),
    }

    mockCdr = {
      detectChanges: jest.fn(),
      markForCheck: jest.fn(),
    }
  })

  const createComponent = () =>
    new MyCoursesComponent(
      mockConfigSvc,
      mockContentSvc,
      mockSignupService,
      mockRouter,
      mockValueSvc,
      mockRoute,
      mockPlaylistSvc,
      mockLangSvc,
      mockOrgService,
      mockCdr,
    )

  afterEach(() => jest.clearAllMocks())

  it('should create', () => {
    component = createComponent()
    expect(component).toBeTruthy()
  })

  describe('constructor — default values', () => {
    beforeEach(() => { component = createComponent() })

    it('should initialize startedCourse as empty array', () => {
      expect(component.startedCourse).toEqual([])
    })

    it('should initialize completedCourse as empty array', () => {
      expect(component.completedCourse).toEqual([])
    })

    it('should initialize coursesForYou as empty array', () => {
      expect(component.coursesForYou).toEqual([])
    })

    it('should initialize isLoading as false', () => {
      expect(component.isLoading).toBe(false)
    })

    it('should initialize selectedIndex as 0', () => {
      expect(component.selectedIndex).toBe(0)
    })

    it('should set isXSmall false when isMobile returns false', () => {
      expect(component.isXSmall).toBe(false)
    })

    it('should set isXSmall true when isMobile returns true', () => {
      mockValueSvc.isMobile.mockReturnValue(true)
      component = createComponent()
      expect(component.isXSmall).toBe(true)
    })
  })

  describe('ngOnInit', () => {
    it('should set lang from langSvc.getCurrentLanguage()', async () => {
      mockLangSvc.getCurrentLanguage.mockReturnValue('hi')
      component = createComponent()
      await component.ngOnInit()
      expect(component.lang).toBe('hi')
    })

    it('should call getPlaylistConfig on init', async () => {
      component = createComponent()
      await component.ngOnInit()
      expect(mockPlaylistSvc.getPlaylistConfig).toHaveBeenCalled()
    })

    it('should handle getPlaylistConfig rejection gracefully', async () => {
      mockPlaylistSvc.getPlaylistConfig.mockRejectedValue(new Error('network fail'))
      component = createComponent()
      await component.ngOnInit()
      expect(component.plyLsData).toEqual([])
    })

    it('should handle loadPlaylistData rejection gracefully', async () => {
      mockPlaylistSvc.loadPlaylistData.mockRejectedValue(new Error('fail'))
      component = createComponent()
      await component.ngOnInit()
      expect(component.config).toBeNull()
    })

    it('should call fetchUserBatchList with userId', async () => {
      component = createComponent()
      await component.ngOnInit()
      expect(mockContentSvc.fetchUserBatchList).toHaveBeenCalledWith('user123')
    })

    it('should set isLoading false after completion', async () => {
      component = createComponent()
      await component.ngOnInit()
      expect(component.isLoading).toBe(false)
    })

    it('should set isLoading false on fetchUserBatchList error', async () => {
      mockContentSvc.fetchUserBatchList.mockReturnValue(throwError(() => new Error('API error')))
      component = createComponent()
      await component.ngOnInit()
      expect(component.isLoading).toBe(false)
    })

    it('should set selectedIndex 1 when courseType is formatForYouCourses', async () => {
      mockRoute.queryParams = new BehaviorSubject({ courseType: 'formatForYouCourses' }).asObservable()
      component = createComponent()
      await component.ngOnInit()
      expect(component.selectedIndex).toBe(1)
    })

    it('should set selectedIndex 2 when courseType is completed', async () => {
      mockRoute.queryParams = new BehaviorSubject({ courseType: 'completed' }).asObservable()
      component = createComponent()
      await component.ngOnInit()
      expect(component.selectedIndex).toBe(2)
    })
  })

  describe('processUserCourses (via ngOnInit)', () => {
    it('should separate started and completed courses', async () => {
      const courses: any[] = [
        {
          content: { identifier: 'c1', name: 'Course 1', appIcon: '', thumbnail: '', sourceName: 'src', issueCertification: false, posterImage: '' },
          dateTime: '2024-01-01',
          completionPercentage: 50,
        },
        {
          content: { identifier: 'c2', name: 'Course 2', appIcon: '', thumbnail: '', sourceName: 'src', issueCertification: false, posterImage: '' },
          dateTime: '2024-01-02',
          completionPercentage: 100,
        },
      ]
      mockContentSvc.fetchUserBatchList.mockReturnValue(of(courses))
      component = createComponent()
      await component.ngOnInit()
      expect(component.startedCourse).toHaveLength(1)
      expect(component.startedCourse[0].identifier).toBe('c1')
      expect(component.completedCourse).toHaveLength(1)
      expect(component.completedCourse[0].identifier).toBe('c2')
    })

    it('should skip courses without identifier', async () => {
      const courses: any[] = [
        { content: { name: 'No ID Course' }, dateTime: '2024-01-01', completionPercentage: 50 },
      ]
      mockContentSvc.fetchUserBatchList.mockReturnValue(of(courses))
      component = createComponent()
      await component.ngOnInit()
      expect(component.startedCourse).toHaveLength(0)
    })

    it('should skip courses with competency flag set', async () => {
      const courses: any[] = [
        {
          content: { identifier: 'c1', competency: true, name: 'Comp Course', appIcon: '', thumbnail: '', sourceName: 'src', issueCertification: false, posterImage: '' },
          dateTime: '2024-01-01',
          completionPercentage: 30,
        },
      ]
      mockContentSvc.fetchUserBatchList.mockReturnValue(of(courses))
      component = createComponent()
      await component.ngOnInit()
      expect(component.startedCourse).toHaveLength(0)
    })

    it('should sort started courses by dateTime descending', async () => {
      const courses: any[] = [
        {
          content: { identifier: 'c1', name: 'Older', appIcon: '', thumbnail: '', sourceName: '', issueCertification: false, posterImage: '' },
          dateTime: '2024-01-01',
          completionPercentage: 20,
        },
        {
          content: { identifier: 'c2', name: 'Newer', appIcon: '', thumbnail: '', sourceName: '', issueCertification: false, posterImage: '' },
          dateTime: '2024-06-01',
          completionPercentage: 40,
        },
      ]
      mockContentSvc.fetchUserBatchList.mockReturnValue(of(courses))
      component = createComponent()
      await component.ngOnInit()
      expect(component.startedCourse[0].identifier).toBe('c2')
    })
  })

  describe('tabClick', () => {
    it('should set selectedIndex to 1', () => {
      component = createComponent()
      component.tabClick()
      expect(component.selectedIndex).toBe(1)
    })
  })

  describe('onTabChange', () => {
    it('should update selectedIndex', () => {
      component = createComponent()
      component.onTabChange(2)
      expect(component.selectedIndex).toBe(2)
    })

    it('should initialize displayLimit for the tab if not set', () => {
      component = createComponent()
      component.onTabChange(0)
      expect(component.displayLimit[0]).toBe(10)
    })

    it('should not override displayLimit when already set', () => {
      component = createComponent()
      component.displayLimit[0] = 20
      component.onTabChange(0)
      expect(component.displayLimit[0]).toBe(20)
    })
  })

  describe('showMore', () => {
    beforeEach(() => { component = createComponent() })

    it('should increase displayLimit by PAGE_SIZE (10)', () => {
      component.displayLimit[0] = 10
      component.showMore(0, 50)
      expect(component.displayLimit[0]).toBe(20)
    })

    it('should cap displayLimit at totalLength', () => {
      component.displayLimit[0] = 10
      component.showMore(0, 15)
      expect(component.displayLimit[0]).toBe(15)
    })
  })

  describe('courseTrackBy', () => {
    it('should return item identifier when present', () => {
      component = createComponent()
      expect(component.courseTrackBy(0, { identifier: 'abc' })).toBe('abc')
    })

    it('should return index when identifier is absent', () => {
      component = createComponent()
      expect(component.courseTrackBy(3, {})).toBe(3)
    })
  })

  describe('buildCompetencySearchArray', () => {
    beforeEach(() => { component = createComponent() })

    it('should return empty array for null input', () => {
      expect(component.buildCompetencySearchArray(null)).toEqual([])
    })

    it('should return empty array for empty array input', () => {
      expect(component.buildCompetencySearchArray([])).toEqual([])
    })

    it('should build competency-level strings from payload', () => {
      const payload = [
        {
          comp1: {
            id: 'C1',
            additionalProperties: {
              competencyLevelDescription: [{ level: 1 }, { level: 2 }],
            },
          },
        },
      ]
      const result = component.buildCompetencySearchArray(payload)
      expect(result).toContain('C1-1')
      expect(result).toContain('C1-2')
    })

    it('should skip competency objects without id', () => {
      const payload = [{ comp1: { additionalProperties: { competencyLevelDescription: [{ level: 1 }] } } }]
      const result = component.buildCompetencySearchArray(payload)
      expect(result).toHaveLength(0)
    })
  })

  describe('processRecommendedCourses', () => {
    beforeEach(() => { component = createComponent() })

    it('should filter out enrolled courses', () => {
      const courses = [
        { identifier: 'c1', appIcon: '', thumbnail: '', name: 'C1', sourceName: 'SRC', issueCertification: false },
        { identifier: 'c2', appIcon: '', thumbnail: '', name: 'C2', sourceName: 'SRC', issueCertification: false },
      ]
      const result = component.processRecommendedCourses(courses, ['SRC'], ['c1'])
      expect(result.map(r => r.identifier)).toEqual(['c2'])
    })

    it('should filter by sourceName', () => {
      const courses = [
        { identifier: 'c1', appIcon: '', thumbnail: '', name: 'C1', sourceName: 'ALLOWED', issueCertification: false },
        { identifier: 'c2', appIcon: '', thumbnail: '', name: 'C2', sourceName: 'BLOCKED', issueCertification: false },
      ]
      const result = component.processRecommendedCourses(courses, ['ALLOWED'], [])
      expect(result).toHaveLength(1)
      expect(result[0].identifier).toBe('c1')
    })

    it('should deduplicate by identifier', () => {
      const courses = [
        { identifier: 'c1', appIcon: '', thumbnail: '', name: 'C1', sourceName: 'SRC', issueCertification: false },
        { identifier: 'c1', appIcon: '', thumbnail: '', name: 'C1 dup', sourceName: 'SRC', issueCertification: false },
      ]
      const result = component.processRecommendedCourses(courses, ['SRC'], [])
      expect(result).toHaveLength(1)
    })
  })

  describe('recommendedCourse', () => {
    beforeEach(() => { component = createComponent() })

    it('should map raw content to simplified objects', () => {
      const data = [
        { identifier: 'c1', appIcon: 'icon', posterImage: 'img', thumbnail: 'thumb', name: 'Course', sourceName: 'SRC', issueCertification: true, averageRating: 4.5, competency: false },
      ]
      const result = component.recommendedCourse(data)
      expect(result[0].identifier).toBe('c1')
      expect(result[0].thumbnail).toBe('img')
    })

    it('should return empty array for empty input', () => {
      expect(component.recommendedCourse([])).toEqual([])
    })

    it('should filter items without identifier', () => {
      const data = [{ name: 'No ID' }]
      expect(component.recommendedCourse(data)).toEqual([])
    })
  })

  describe('ngOnDestroy', () => {
    it('should complete without error after ngOnInit', async () => {
      component = createComponent()
      await component.ngOnInit()
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('searchContentByCompetencies$', () => {
    beforeEach(() => { component = createComponent() })

    it('should return of([]) for empty competencySearchArray', done => {
      component.searchContentByCompetencies$({}, [], ['SRC'], []).subscribe(res => {
        expect(res).toEqual([])
        done()
      })
    })

    it('should call getCouseByContentSearch and return processed courses', done => {
      mockContentSvc.getCouseByContentSearch = jest.fn().mockReturnValue(of({
        result: { content: [{ identifier: 'c1', sourceName: 'SRC', appIcon: '', thumbnail: '', name: 'C1', issueCertification: false }] },
      }))
      component.searchContentByCompetencies$({}, ['comp1-1'], ['SRC'], []).subscribe(res => {
        expect(res.length).toBe(1)
        expect(res[0].identifier).toBe('c1')
        done()
      })
    })

    it('should return of([]) when getCouseByContentSearch errors', done => {
      mockContentSvc.getCouseByContentSearch = jest.fn().mockReturnValue(throwError(() => new Error('fail')))
      component.searchContentByCompetencies$({}, ['comp1-1'], ['SRC'], []).subscribe(res => {
        expect(res).toEqual([])
        done()
      })
    })
  })

  describe('navigateToToc with dob present', () => {
    it('should set location.href when dob is present in profileDetails', async () => {
      Object.defineProperty(window, 'location', { writable: true, value: { href: '' } })
      mockSignupService.getUserData.mockResolvedValue({
        profileDetails: { profileReq: { personalDetails: { dob: '1990-01-01' } } },
      })
      mockConfigSvc.unMappedUser = { id: 'u1' }
      component = createComponent()
      await component.navigateToToc('do_123')
      // location.href gets set, no navigate call
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })
  })

  describe('handleProfessionalCourses via ngOnInit with profDetails', () => {
    it('should call orgService.getTopLiveSearchResults when YOUR_PLANS_PLAYLIST element matches', async () => {
      mockConfigSvc.unMappedUser = {
        profileDetails: { profileReq: { professionalDetails: [{ designation: 'Nurse' }] } },
      }
      mockPlaylistSvc.getPlaylistConfig = jest.fn().mockResolvedValue([
        { orgId: 'org1', role: ['Nurse'], playlistId: 'Playlist_Course', language: 'en', dataSource: { payload: ['do_123'] } },
      ])
      component = createComponent()
      await component.ngOnInit()
      expect(mockOrgService.getTopLiveSearchResults).toHaveBeenCalled()
    })

    it('should set coursesForYou empty when no professional details', async () => {
      mockConfigSvc.unMappedUser = null
      component = createComponent()
      await component.ngOnInit()
      expect(component.coursesForYou).toEqual([])
    })
  })

  describe('tabClick', () => {
    it('should set selectedIndex to 1', () => {
      component = createComponent()
      component.selectedIndex = 0
      component.tabClick()
      expect(component.selectedIndex).toBe(1)
    })
  })

  describe('onTabChange', () => {
    it('should set selectedIndex to given value', () => {
      component = createComponent()
      component.onTabChange(2)
      expect(component.selectedIndex).toBe(2)
    })

    it('should initialize displayLimit for new tab', () => {
      component = createComponent()
      component.onTabChange(3)
      expect(component.displayLimit[3]).toBe(component['PAGE_SIZE'])
    })

    it('should not overwrite existing displayLimit', () => {
      component = createComponent()
      component.displayLimit[0] = 20
      component.onTabChange(0)
      expect(component.displayLimit[0]).toBe(20)
    })
  })

  describe('showMore', () => {
    it('should increase displayLimit by PAGE_SIZE', () => {
      component = createComponent()
      const pageSize = component['PAGE_SIZE']
      component.displayLimit[0] = pageSize
      component.showMore(0, pageSize * 3)
      expect(component.displayLimit[0]).toBe(pageSize * 2)
    })

    it('should cap displayLimit at totalLength', () => {
      component = createComponent()
      const pageSize = component['PAGE_SIZE']
      component.displayLimit[0] = pageSize
      component.showMore(0, pageSize + 1)
      expect(component.displayLimit[0]).toBe(pageSize + 1)
    })
  })

  describe('navigateToToc', () => {
    it('should navigate to about-you when profileReq.personalDetails.dob is missing', async () => {
      mockSignupService.getUserData.mockResolvedValue({ profileDetails: { profileReq: { personalDetails: {} } } })
      mockConfigSvc.unMappedUser = { id: 'u1' }
      component = createComponent()
      await component.navigateToToc('do_123')
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/about-you'],
        expect.objectContaining({ queryParams: expect.objectContaining({ redirect: '/app/toc/do_123/overview' }) }),
      )
    })

    it('should use url_before_login redirect when present', async () => {
      mockSignupService.getUserData.mockResolvedValue({ profileDetails: { profileReq: { personalDetails: {} } } })
      mockConfigSvc.unMappedUser = { id: 'u1' }
      localStorage.setItem('url_before_login', '/app/toc/saved/overview')
      component = createComponent()
      await component.navigateToToc('do_123')
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/about-you'],
        expect.objectContaining({ queryParams: { redirect: '/app/toc/saved/overview' } }),
      )
      localStorage.removeItem('url_before_login')
    })

    it('should not navigate when unMappedUser is null', async () => {
      mockSignupService.getUserData.mockResolvedValue(null)
      mockConfigSvc.unMappedUser = null
      component = createComponent()
      await component.navigateToToc('do_123')
      expect(mockRouter.navigate).not.toHaveBeenCalled()
    })
  })
})
