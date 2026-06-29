import { Router } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { of, Subject, throwError } from 'rxjs'
import { signal } from '@angular/core'
import { WebPublicComponent } from './web-public-container.component'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'
import { ScrollService } from '../../services/scroll.service'
import { ConfigurationsService, LoggerService, ValueService } from '@ws-widget/utils'
import { PlaylistService } from '../../services/playlist.service'
import { LanguageService } from '../../services/language.service'

// The root node_modules/lodash is 3.x which lacks uniqBy (added in lodash 4).
// Provide a minimal shim so component code that calls uniqBy works in tests.
jest.mock('lodash', () => ({
  uniqBy: (arr: any[], key: string) => {
    const seen = new Set()
    return (arr || []).filter((item: any) => {
      const k = item[key]
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
  },
}))
// The component imports WidgetContentService from the full collection public-api.
// Mocking the public-api prevents its transitive Angular Material imports from
// failing in the jsdom test environment.
jest.mock('../../../../library/ws-widget/collection/src/public-api', () => ({
  WidgetContentService: class MockWidgetContentService {
    getCouseByContentSearch = jest.fn()
  },
}))

// playlist.service.ts imports from the full utils public-api, which loads
// ngx-image-cropper and fails in jsdom. Mock the service to avoid that chain.
jest.mock('../../services/playlist.service', () => ({
  PlaylistService: class MockPlaylistService {
    getPlaylistConfig = jest.fn().mockResolvedValue([])
  },
}))

import { WidgetContentService } from '../../../../library/ws-widget/collection/src/public-api'

const scrollToDivEvent$ = new Subject<string>()

const mockRouter: Partial<Router> = {
  navigateByUrl: jest.fn(),
  navigate: jest.fn(),
}

const mockDialog: Partial<MatDialog> = {
  open: jest.fn(),
}

const mockScrollService: Partial<ScrollService> = {
  scrollToDivEvent: scrollToDivEvent$ as any,
  scrollToElement: jest.fn(),
}

const mockConfigSvc: Partial<ConfigurationsService> = {
  userProfile: null,
  unMappedUser: null,
}

const mockPlaylistSvc: Partial<PlaylistService> = {
  getPlaylistConfig: jest.fn().mockResolvedValue([]),
}

const mockLangSvc: Partial<LanguageService> = {
  getCurrentLanguage: jest.fn().mockReturnValue('en'),
}

const isMobileSignal = signal(false)

const mockValueSvc: Partial<ValueService> = {
  isMobile: isMobileSignal,
}

const mockLogger: Partial<LoggerService> = {
  log: jest.fn(),
  error: jest.fn(),
}

const mockContentSvc = {
  getCouseByContentSearch: jest.fn(),
}

const mockOrgService: Partial<OrgServiceService> = {
  getTopLiveSearchResults: jest.fn(),
}

function createComponent(): WebPublicComponent {
  return new WebPublicComponent(
    mockRouter as Router,
    mockDialog as MatDialog,
    mockOrgService as OrgServiceService,
    mockScrollService as ScrollService,
    mockConfigSvc as ConfigurationsService,
    mockPlaylistSvc as PlaylistService,
    mockLangSvc as LanguageService,
    mockValueSvc as ValueService,
    mockLogger as LoggerService,
    mockContentSvc as unknown as WidgetContentService,
  )
}

describe('WebPublicComponent', () => {
  let component: WebPublicComponent

  beforeEach(() => {
    jest.clearAllMocks()
    isMobileSignal.set(false)
    ;(mockPlaylistSvc.getPlaylistConfig as jest.Mock).mockResolvedValue([])
    component = createComponent()
    component.sections = { find: jest.fn().mockReturnValue(null) } as any
  })

  // ─── Component creation ────────────────────────────────────────────────────

  describe('creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy()
    })

    it('should initialise lang from LanguageService on construction', () => {
      expect(component['lang']).toBe('en')
      expect(mockLangSvc.getCurrentLanguage).toHaveBeenCalled()
    })

    it('should initialise signals with empty arrays and false', () => {
      expect(component.topCertifiedCourse()).toEqual([])
      expect(component.cneCourse()).toEqual([])
      expect(component.coursesForYou()).toEqual([])
      expect(component.coursesForEK()).toEqual([])
      expect(component.isLoading()).toBe(false)
    })

    it('should have default pagination values', () => {
      expect(component.currentOffset).toBe(0)
      expect(component.pageLimit).toBe(500)
      expect(component.initialPageLimit).toBe(10)
    })
  })

  // ─── buildCompetencySearchArray ────────────────────────────────────────────

  describe('buildCompetencySearchArray', () => {
    it('should return [] for null input', () => {
      expect(component.buildCompetencySearchArray(null as any)).toEqual([])
    })

    it('should return [] for undefined input', () => {
      expect(component.buildCompetencySearchArray(undefined as any)).toEqual([])
    })

    it('should return [] for empty array', () => {
      expect(component.buildCompetencySearchArray([])).toEqual([])
    })

    it('should return [] when competency has no id', () => {
      const payload = [{ comp1: { additionalProperties: { competencyLevelDescription: [{ level: 1 }] } } }]
      expect(component.buildCompetencySearchArray(payload)).toEqual([])
    })

    it('should return [] when there are no levelDescriptions', () => {
      const payload = [{ comp1: { id: 'C1', additionalProperties: { competencyLevelDescription: [] } } }]
      expect(component.buildCompetencySearchArray(payload)).toEqual([])
    })

    it('should return "id-level" strings for each level', () => {
      const payload = [{
        comp1: {
          id: 'C1',
          additionalProperties: {
            competencyLevelDescription: [{ level: 1 }, { level: 2 }],
          },
        },
      }]
      expect(component.buildCompetencySearchArray(payload)).toEqual(['C1-1', 'C1-2'])
    })

    it('should aggregate across multiple competency objects in the array', () => {
      const payload = [
        {
          comp1: {
            id: 'C1',
            additionalProperties: { competencyLevelDescription: [{ level: 1 }] },
          },
        },
        {
          comp2: {
            id: 'C2',
            additionalProperties: { competencyLevelDescription: [{ level: 3 }] },
          },
        },
      ]
      expect(component.buildCompetencySearchArray(payload)).toEqual(['C1-1', 'C2-3'])
    })

    it('should skip level entries that have no level value', () => {
      const payload = [{
        comp1: {
          id: 'C1',
          additionalProperties: {
            competencyLevelDescription: [{ level: 0 }, { level: 2 }],
          },
        },
      }]
      // level 0 is falsy → skipped
      expect(component.buildCompetencySearchArray(payload)).toEqual(['C1-2'])
    })

    it('should handle missing additionalProperties gracefully', () => {
      const payload = [{ comp1: { id: 'C1' } }]
      expect(component.buildCompetencySearchArray(payload)).toEqual([])
    })
  })

  // ─── recommendedCourse ─────────────────────────────────────────────────────

  describe('recommendedCourse', () => {
    it('should return [] for empty input', () => {
      expect(component.recommendedCourse([])).toEqual([])
    })

    it('should filter out items without identifier', () => {
      const data = [{ name: 'No ID' }, { identifier: 'id1', name: 'Course 1', appIcon: 'icon', posterImage: 'poster', sourceName: 'src', issueCertification: false, averageRating: 4, competency: [] }]
      const result = component.recommendedCourse(data)
      expect(result).toHaveLength(1)
      expect(result[0].identifier).toBe('id1')
    })

    it('should prefer posterImage over thumbnail', () => {
      const data = [{ identifier: 'id1', posterImage: 'poster.png', thumbnail: 'thumb.png' }]
      const result = component.recommendedCourse(data)
      expect(result[0].thumbnail).toBe('poster.png')
    })

    it('should fall back to thumbnail when posterImage is absent', () => {
      const data = [{ identifier: 'id1', thumbnail: 'thumb.png' }]
      const result = component.recommendedCourse(data)
      expect(result[0].thumbnail).toBe('thumb.png')
    })

    it('should map all required fields', () => {
      const data = [{
        identifier: 'id1',
        appIcon: 'icon.png',
        posterImage: 'poster.png',
        name: 'Test Course',
        sourceName: 'Source',
        issueCertification: true,
        averageRating: 4.5,
        competency: ['comp1'],
      }]
      const result = component.recommendedCourse(data)
      expect(result[0]).toEqual({
        identifier: 'id1',
        appIcon: 'icon.png',
        thumbnail: 'poster.png',
        name: 'Test Course',
        sourceName: 'Source',
        issueCertification: true,
        averageRating: 4.5,
        competency: ['comp1'],
      })
    })
  })

  // ─── processRecommendedCourses ─────────────────────────────────────────────

  describe('processRecommendedCourses', () => {
    const makeCourse = (id: string, src: string) => ({
      identifier: id,
      name: `Course ${id}`,
      sourceName: src,
      appIcon: '',
      posterImage: '',
      issueCertification: false,
      averageRating: 0,
      competency: [],
    })

    it('should return [] for empty course list', () => {
      expect(component.processRecommendedCourses([], ['Src'], [])).toEqual([])
    })

    it('should filter out enrolled courses', () => {
      const courses = [makeCourse('c1', 'Src'), makeCourse('c2', 'Src')]
      const result = component.processRecommendedCourses(courses, ['Src'], ['c1'])
      expect(result.map(r => r.identifier)).toEqual(['c2'])
    })

    it('should filter out courses not in requiredSourceName', () => {
      const courses = [makeCourse('c1', 'OtherSrc'), makeCourse('c2', 'AllowedSrc')]
      const result = component.processRecommendedCourses(courses, ['AllowedSrc'], [])
      expect(result.map(r => r.identifier)).toEqual(['c2'])
    })

    it('should deduplicate by identifier', () => {
      const courses = [makeCourse('c1', 'Src'), makeCourse('c1', 'Src')]
      const result = component.processRecommendedCourses(courses, ['Src'], [])
      expect(result).toHaveLength(1)
    })

    it('should return [] when no sourceNames match', () => {
      const courses = [makeCourse('c1', 'Src')]
      expect(component.processRecommendedCourses(courses, [], [])).toEqual([])
    })

    it('should pass all filters and return matching courses', () => {
      const courses = [makeCourse('c1', 'Src'), makeCourse('c2', 'Src'), makeCourse('c3', 'Other')]
      const result = component.processRecommendedCourses(courses, ['Src'], ['c1'])
      expect(result.map(r => r.identifier)).toEqual(['c2'])
    })
  })

  // ─── searchContentByCompetencies$ ─────────────────────────────────────────

  describe('searchContentByCompetencies$', () => {
    it('should return of([]) when competencySearchArray is empty', done => {
      component.searchContentByCompetencies$({}, [], [], []).subscribe(result => {
        expect(result).toEqual([])
        done()
      })
    })

    it('should return of([]) when competencySearchArray is not an array', done => {
      component.searchContentByCompetencies$({}, null as any, [], []).subscribe(result => {
        expect(result).toEqual([])
        done()
      })
    })

    it('should call contentSvc.getCouseByContentSearch with correct args', done => {
      const fakeContent = [{ identifier: 'c1', sourceName: 'Src' }]
      ;(mockContentSvc.getCouseByContentSearch as jest.Mock).mockReturnValue(
        of({ result: { content: fakeContent } })
      )
      const searchArray = ['C1-1']
      const baseQuery = { request: { filters: { sourceName: ['Src'] } } }

      component.searchContentByCompetencies$(baseQuery, searchArray, ['Src'], []).subscribe(() => {
        expect(mockContentSvc.getCouseByContentSearch).toHaveBeenCalledWith(
          searchArray,
          true,
          expect.objectContaining({
            request: expect.objectContaining({
              filters: expect.objectContaining({ competencySearch: searchArray }),
            }),
          })
        )
        done()
      })
    })

    it('should map content through processRecommendedCourses', done => {
      const fakeContent = [{ identifier: 'c1', sourceName: 'Src' }]
      ;(mockContentSvc.getCouseByContentSearch as jest.Mock).mockReturnValue(
        of({ result: { content: fakeContent } })
      )
      jest.spyOn(component, 'processRecommendedCourses').mockReturnValue([{ identifier: 'c1' }] as any)

      component.searchContentByCompetencies$({}, ['C1-1'], ['Src'], []).subscribe(result => {
        expect(component.processRecommendedCourses).toHaveBeenCalled()
        expect(result).toEqual([{ identifier: 'c1' }])
        done()
      })
    })

    it('should return [] and not throw on API error', done => {
      ;(mockContentSvc.getCouseByContentSearch as jest.Mock).mockReturnValue(
        throwError(() => new Error('Network error'))
      )
      component.searchContentByCompetencies$({}, ['C1-1'], ['Src'], []).subscribe(result => {
        expect(result).toEqual([])
        done()
      })
    })

    it('should handle missing result.content gracefully', done => {
      ;(mockContentSvc.getCouseByContentSearch as jest.Mock).mockReturnValue(of({ result: {} }))
      component.searchContentByCompetencies$({}, ['C1-1'], ['Src'], []).subscribe(result => {
        expect(result).toEqual([])
        done()
      })
    })
  })

  // ─── ngOnChanges ──────────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    beforeEach(() => {
      jest.spyOn(component, 'updateCourseData').mockImplementation(() => {})
    })

    it('should call updateCourseData when userEnrollCourse changes and not loading', () => {
      component.isLoading.set(false)
      component.ngOnChanges({ userEnrollCourse: {} as any })
      expect(component.updateCourseData).toHaveBeenCalled()
    })

    it('should call updateCourseData when configData changes and not loading', () => {
      component.isLoading.set(false)
      component.ngOnChanges({ configData: {} as any })
      expect(component.updateCourseData).toHaveBeenCalled()
    })

    it('should NOT call updateCourseData while isLoading is true', () => {
      component.isLoading.set(true)
      component.ngOnChanges({ userEnrollCourse: {} as any })
      expect(component.updateCourseData).not.toHaveBeenCalled()
    })

    it('should NOT call updateCourseData when unrelated input changes', () => {
      component.isLoading.set(false)
      component.ngOnChanges({ isEkshamata: {} as any })
      expect(component.updateCourseData).not.toHaveBeenCalled()
    })
  })

  // ─── updateCourseData ─────────────────────────────────────────────────────

  describe('updateCourseData', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should set isLoading to false after timeout', () => {
      component.configData = null
      component.isLoading.set(true)  // simulate a prior loading state
      component.updateCourseData()
      expect(component.isLoading()).toBe(true)  // timeout hasn't fired yet
      jest.runAllTimers()
      expect(component.isLoading()).toBe(false)
    })

    it('should skip config loop when configData is not an array', () => {
      component.configData = { playlistConfigId: 'TOP_COURSE_PLAYLIST' }
      expect(() => component.updateCourseData()).not.toThrow()
    })

    it('should populate CONTINUE_LEARNING element with incomplete enrolled courses', () => {
      const enrolledCourses = [
        { identifier: 'c1', completionPercentage: 50 },
        { identifier: 'c2', completionPercentage: 100 },
      ]
      component.coursesForYou.set([{ identifier: 'c1' }])
      component.userEnrollCourse = enrolledCourses
      const configEl = { playlistConfigId: 'CONTINUE_LEARNING', limit: 5, data: [], displayData: [] }
      component.configData = [configEl]

      component.updateCourseData()

      expect(configEl.data).toHaveLength(1)
      expect(configEl.data[0].identifier).toBe('c1')
    })

    it('should populate COMPLETED element with 100% complete enrolled courses in coursesForYou', () => {
      const enrolledCourses = [
        { identifier: 'c1', completionPercentage: 100 },
        { identifier: 'c2', completionPercentage: 50 },
      ]
      component.coursesForYou.set([{ identifier: 'c1' }])
      component.userEnrollCourse = enrolledCourses
      const configEl = { playlistConfigId: 'COMPLETED', limit: 5, data: [], displayData: [] }
      component.configData = [configEl]

      component.updateCourseData()

      expect(configEl.data).toHaveLength(1)
      expect(configEl.data[0].identifier).toBe('c1')
    })

    it('should populate YOUR_PLANS_PLAYLIST with courses not yet enrolled', () => {
      component.coursesForYou.set([{ identifier: 'c1' }, { identifier: 'c2' }])
      component.userEnrollCourse = [{ identifier: 'c1' }]
      const configEl = { playlistConfigId: 'YOUR_PLANS_PLAYLIST', limit: 5, data: [], displayData: [] }
      component.configData = [configEl]

      component.updateCourseData()

      expect(configEl.data).toHaveLength(1)
      expect(configEl.data[0].identifier).toBe('c2')
    })

    it('should populate CNE_COURSE_PLAYLIST from cneCourse signal', () => {
      component.cneCourse.set([{ identifier: 'cne1' }])
      const configEl = { playlistConfigId: 'CNE_COURSE_PLAYLIST', limit: 5, data: [], displayData: [] }
      component.configData = [configEl]

      component.updateCourseData()

      expect(configEl.data).toEqual([{ identifier: 'cne1' }])
    })

    it('should use topCertifiedCourse for TOP_COURSE_PLAYLIST when not ekshamata', () => {
      component.topCertifiedCourse.set([{ identifier: 'top1' }])
      component.isEkshamata = false
      const configEl = { playlistConfigId: 'TOP_COURSE_PLAYLIST', limit: 5, data: [], displayData: [] }
      component.configData = [configEl]

      component.updateCourseData()

      expect(configEl.data).toEqual([{ identifier: 'top1' }])
    })

    it('should use coursesForEK for TOP_COURSE_PLAYLIST when isEkshamata is true', () => {
      component.coursesForEK.set([{ identifier: 'ek1' }])
      component.isEkshamata = true
      const configEl = { playlistConfigId: 'TOP_COURSE_PLAYLIST', limit: 5, data: [], displayData: [] }
      component.configData = [configEl]

      component.updateCourseData()

      expect(configEl.data).toEqual([{ identifier: 'ek1' }])
    })

    it('should slice data to limit for displayData', () => {
      component.cneCourse.set([{ identifier: 'c1' }, { identifier: 'c2' }, { identifier: 'c3' }])
      const configEl = { playlistConfigId: 'CNE_COURSE_PLAYLIST', limit: 2, data: [], displayData: [] }
      component.configData = [configEl]

      component.updateCourseData()

      expect(configEl.displayData).toHaveLength(2)
    })
  })

  // ─── raiseTelemetry ───────────────────────────────────────────────────────

  describe('raiseTelemetry', () => {
    it('should navigate to toc overview URL for a given identifier', () => {
      component.raiseTelemetry('course-abc')
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/toc/course-abc/overview')
    })
  })

  // ─── openIframe ───────────────────────────────────────────────────────────

  describe('openIframe', () => {
    it('should navigate to video-player with video index query param', () => {
      component.openIframe({ videoIndex: 2 })
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/app/video-player'],
        { queryParams: { video: 2 } }
      )
    })
  })

  // ─── viewAllCourse ────────────────────────────────────────────────────────

  describe('viewAllCourse', () => {
    describe('continueLearning courseType', () => {
      it('should reset displayData to limit when already viewing all', () => {
        component.userEnrollCourse = [{ id: 1 }, { id: 2 }, { id: 3 }]
        const content = {
          button: { courseType: 'continueLearning' },
          data: [{ id: 1 }, { id: 2 }],
          displayData: [{ id: 1 }, { id: 2 }],
          limit: 1,
        }
        component.viewAllCourse(content)
        expect(content.displayData).toHaveLength(1)
      })

      it('should navigate to my_courses on desktop when not viewing all', () => {
        isMobileSignal.set(false)
        const content = {
          button: { courseType: 'continueLearning' },
          data: [{ id: 1 }, { id: 2 }],
          displayData: [{ id: 1 }],
          limit: 1,
        }
        component.viewAllCourse(content)
        expect(mockRouter.navigate).toHaveBeenCalledWith(
          ['app/user/my_courses'],
          { queryParams: { courseType: 'continueLearning' } }
        )
      })

      it('should expand displayData on mobile when not viewing all', () => {
        isMobileSignal.set(true)
        component.userEnrollCourse = [{ id: 1 }, { id: 2 }]
        const content = {
          button: { courseType: 'continueLearning' },
          data: [{ id: 1 }, { id: 2 }],
          displayData: [{ id: 1 }],
          limit: 1,
        }
        component.viewAllCourse(content)
        expect(content.displayData).toEqual(component.userEnrollCourse)
      })
    })

    describe('topCourse courseType', () => {
      it('should reset displayData to limit when already viewing all', () => {
        const topCourses = [{ id: 1 }, { id: 2 }, { id: 3 }]
        component.topCertifiedCourse.set(topCourses)
        const content = {
          button: { courseType: 'topCourse' },
          data: topCourses,
          displayData: topCourses,
          limit: 1,
        }
        component.viewAllCourse(content)
        expect(content.displayData).toHaveLength(1)
      })

      it('should navigate to search on desktop when not viewing all', () => {
        isMobileSignal.set(false)
        component.topCertifiedCourse.set([{ id: 1 }, { id: 2 }])
        component['topCertifiedCourseIdentifier'] = ['id1', 'id2']
        const content = {
          button: { courseType: 'topCourse' },
          data: [{ id: 1 }, { id: 2 }],
          displayData: [{ id: 1 }],
          limit: 1,
        }
        component.viewAllCourse(content)
        expect(mockRouter.navigate).toHaveBeenCalledWith(
          ['app/search/topCourse'],
          expect.objectContaining({ queryParams: { courseType: 'topCourse', data: ['id1', 'id2'] } })
        )
      })
    })

    describe('cneCourses courseType', () => {
      it('should reset displayData to limit when already viewing all', () => {
        const cneCourses = [{ id: 1 }, { id: 2 }]
        component.cneCourse.set(cneCourses)
        const content = {
          button: { courseType: 'cneCourses' },
          data: cneCourses,
          displayData: cneCourses,
          limit: 1,
        }
        component.viewAllCourse(content)
        expect(content.displayData).toHaveLength(1)
      })
    })
  })

  // ─── ngOnInit ─────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      component.sections = { find: jest.fn().mockReturnValue(null) } as any
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should complete loading (isLoading false) when no identifiers exist', async () => {
      ;(mockConfigSvc as any).userProfile = null
      await component.ngOnInit()
      // handleCompetencyFlow finds no competencies → sets isLoading(false)
      expect(component.isLoading()).toBe(false)
    })

    it('should skip playlist fetch when userProfile is null', async () => {
      ;(mockConfigSvc as any).userProfile = null
      await component.ngOnInit()
      expect(mockPlaylistSvc.getPlaylistConfig).not.toHaveBeenCalled()
    })

    it('should fetch playlist config when userProfile is present', async () => {
      ;(mockConfigSvc as any).userProfile = { rootOrgId: 'org1' }
      ;(mockPlaylistSvc.getPlaylistConfig as jest.Mock).mockResolvedValue([])
      jest.spyOn(component as any, 'handleCompetencyFlow').mockImplementation(() => {})

      await component.ngOnInit()

      expect(mockPlaylistSvc.getPlaylistConfig).toHaveBeenCalled()
    })

    it('should call fetchEnvironmentConfigurations when playlist identifiers are populated', async () => {
      ;(mockConfigSvc as any).userProfile = { rootOrgId: 'org1' }
      ;(mockConfigSvc as any).unMappedUser = null
      component['topCertifiedCourseIdentifier'] = ['c1']
      jest.spyOn(component as any, 'fetchEnvironmentConfigurations').mockImplementation(() => {})
      ;(mockPlaylistSvc.getPlaylistConfig as jest.Mock).mockResolvedValue([])

      await component.ngOnInit()

      expect((component as any).fetchEnvironmentConfigurations).toHaveBeenCalled()
    })

    it('should slice configData when it is an array', async () => {
      ;(mockConfigSvc as any).userProfile = null
      component.configData = [{ id: 'start' }, { id: 'mid1' }, { id: 'mid2' }, { id: 'end' }]
      jest.spyOn(component as any, 'handleCompetencyFlow').mockImplementation(() => {})

      await component.ngOnInit()

      // slice(1, -1) → ['mid1', 'mid2']
      expect(component.uiConfig()).toHaveLength(2)
    })

    it('should use fallback identifiers from uiConfig when playlist returns empty', async () => {
      ;(mockConfigSvc as any).userProfile = { rootOrgId: 'org1' }
      ;(mockPlaylistSvc.getPlaylistConfig as jest.Mock).mockResolvedValue([])

      // slice(1, -1) on a 4-element array keeps the 2 middle items
      component.configData = [
        { playlistConfigId: 'IGNORED_START' },
        { playlistConfigId: 'TOP_COURSE_PLAYLIST', payload: ['top1'] },
        { playlistConfigId: 'CNE_COURSE_PLAYLIST', payload: ['cne1'] },
        { playlistConfigId: 'IGNORED_END' },
      ]
      jest.spyOn(component as any, 'fetchEnvironmentConfigurations').mockImplementation(() => {})

      await component.ngOnInit()

      expect(component['topCertifiedCourseIdentifier']).toEqual(['top1'])
      expect(component['cneCoursesIdentifier']).toEqual(['cne1'])
    })
  })

  // ─── ngOnDestroy ──────────────────────────────────────────────────────────

  describe('ngOnDestroy', () => {
    it('should complete the destroy$ subject', () => {
      const nextSpy = jest.spyOn(component['destroy$'], 'next')
      const completeSpy = jest.spyOn(component['destroy$'], 'complete')

      component.ngOnDestroy()

      expect(nextSpy).toHaveBeenCalled()
      expect(completeSpy).toHaveBeenCalled()
    })

    it('should clear courseRecommendationTimeout if set', () => {
      jest.useFakeTimers()
      component['courseRecommendationTimeout'] = setTimeout(() => {}, 5000)
      const clearSpy = jest.spyOn(window, 'clearTimeout')

      component.ngOnDestroy()

      expect(clearSpy).toHaveBeenCalledWith(component['courseRecommendationTimeout'])
      jest.useRealTimers()
    })

    it('should not throw when courseRecommendationTimeout is not set', () => {
      component['courseRecommendationTimeout'] = undefined
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  // ─── handleScrollEvents integration ───────────────────────────────────────
  // Each test gets its own Subject so prior subscriptions don't bleed in.

  describe('handleScrollEvents', () => {
    let localScroll$: Subject<string>
    let localComponent: WebPublicComponent

    beforeEach(() => {
      localScroll$ = new Subject<string>()
      ;(mockScrollService as any).scrollToDivEvent = localScroll$
      localComponent = createComponent()
    })

    afterEach(() => {
      ;(mockScrollService as any).scrollToDivEvent = scrollToDivEvent$
    })

    it('should call scrollToElement when a matching section is found', () => {
      const fakeNativeEl = { getAttribute: jest.fn().mockReturnValue('section-1') } as any
      localComponent.sections = { find: jest.fn().mockReturnValue({ nativeElement: fakeNativeEl }) } as any
      ;(localComponent as any).handleScrollEvents()

      localScroll$.next('section-1')

      expect(mockScrollService.scrollToElement).toHaveBeenCalledWith(fakeNativeEl)
    })

    it('should not call scrollToElement when no matching section is found', () => {
      localComponent.sections = { find: jest.fn().mockReturnValue(null) } as any
      ;(localComponent as any).handleScrollEvents()

      localScroll$.next('missing-section')

      expect(mockScrollService.scrollToElement).not.toHaveBeenCalled()
    })

    it('should invoke the sections.find predicate callback (line 262) when event fires', () => {
      const nativeEl = { getAttribute: jest.fn().mockReturnValue('target-section') }
      localComponent.sections = {
        find: jest.fn().mockImplementation((predicate: any) => {
          const fakeSection = { nativeElement: nativeEl }
          return predicate(fakeSection) ? { nativeElement: nativeEl } : null
        }),
      } as any
      ;(localComponent as any).handleScrollEvents()
      localScroll$.next('target-section')
      expect(nativeEl.getAttribute).toHaveBeenCalledWith('data-scroll')
      expect(mockScrollService.scrollToElement).toHaveBeenCalledWith(nativeEl)
    })
  })

  // ─── isXSmall computed ────────────────────────────────────────────────────

  describe('isXSmall computed', () => {
    it('should reflect ValueService.isMobile() returning false', () => {
      isMobileSignal.set(false)
      expect(component.isXSmall()).toBe(false)
    })

    it('should reflect ValueService.isMobile() returning true', () => {
      isMobileSignal.set(true)
      expect(component.isXSmall()).toBe(true)
    })
  })

  // ─── ngOnInit plyLsData loop (lines 92-109) ───────────────────────────────

  describe('ngOnInit plyLsData element processing', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      ;(mockConfigSvc as any).userProfile = { rootOrgId: 'org1' }
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should populate topCertifiedCourseIdentifier from matching plyLsData element', async () => {
      ;(mockPlaylistSvc.getPlaylistConfig as jest.Mock).mockResolvedValue([{
        orgId: 'org1', language: 'en', playlistId: 'TOP_COURSE_PLAYLIST',
        dataSource: { payload: ['c1', 'c2'] }, role: [],
      }])
      jest.spyOn(component as any, 'fetchEnvironmentConfigurations').mockImplementation(() => {})
      await component.ngOnInit()
      expect(component['topCertifiedCourseIdentifier']).toEqual(['c1', 'c2'])
    })

    it('should populate cneCoursesIdentifier from matching plyLsData element', async () => {
      ;(mockPlaylistSvc.getPlaylistConfig as jest.Mock).mockResolvedValue([{
        orgId: 'org1', language: 'en', playlistId: 'CNE_COURSE_PLAYLIST',
        dataSource: { payload: ['cne1'] }, role: [],
      }])
      jest.spyOn(component as any, 'fetchEnvironmentConfigurations').mockImplementation(() => {})
      await component.ngOnInit()
      expect(component['cneCoursesIdentifier']).toEqual(['cne1'])
    })

    it('should skip elements with mismatched orgId or language', async () => {
      ;(mockPlaylistSvc.getPlaylistConfig as jest.Mock).mockResolvedValue([{
        orgId: 'other-org', language: 'en', playlistId: 'TOP_COURSE_PLAYLIST',
        dataSource: { payload: ['c1'] }, role: [],
      }])
      jest.spyOn(component as any, 'handleCompetencyFlow').mockImplementation(() => {})
      await component.ngOnInit()
      expect(component['topCertifiedCourseIdentifier']).toEqual([])
    })

    it('should populate yourPlansCourseIdentifier when designation matches role', async () => {
      ;(mockConfigSvc as any).unMappedUser = {
        profileDetails: { profileReq: { professionalDetails: [{ designation: 'Doctor' }] } },
      }
      ;(mockPlaylistSvc.getPlaylistConfig as jest.Mock).mockResolvedValue([{
        orgId: 'org1', language: 'en', playlistId: 'YOUR_PLANS_PLAYLIST',
        dataSource: { payload: ['plan1'] }, role: ['doctor'],
      }])
      jest.spyOn(component as any, 'fetchEnvironmentConfigurations').mockImplementation(() => {})
      await component.ngOnInit()
      expect(component['yourPlansCourseIdentifier']).toEqual(['plan1'])
    })

    it('should populate featuredCourseIdentifier when isEkshamata and FEATURED_COURSE_PLAYLIST', async () => {
      component.isEkshamata = true
      ;(mockPlaylistSvc.getPlaylistConfig as jest.Mock).mockResolvedValue([{
        orgId: 'org1', language: 'en', playlistId: 'FEATURED_COURSE_PLAYLIST',
        dataSource: { payload: ['feat1'] }, role: [],
      }])
      jest.spyOn(component as any, 'fetchEnvironmentConfigurations').mockImplementation(() => {})
      await component.ngOnInit()
      expect(component['featuredCourseIdentifier']).toEqual(['feat1'])
    })
  })

  // ─── handleCompetencyFlow internals ───────────────────────────────────────

  describe('handleCompetencyFlow', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should set isLoading false and return when no competency array', () => {
      component['plyLsData'] = []
      ;(component as any).handleCompetencyFlow('org1', () => false)
      expect(component.isLoading()).toBe(false)
    })

    it('should process COMPETENCY_PLAYLIST and build search array', () => {
      const competencyPayload = [{
        comp1: { id: 'C1', additionalProperties: { competencyLevelDescription: [{ level: 1 }] } },
      }]
      component['plyLsData'] = [{
        orgId: 'org1', role: ['doctor'],
        playlistId: 'COMPETENCY_PLAYLIST',
        dataSource: { payload: competencyPayload },
      }]
      ;(mockContentSvc.getCouseByContentSearch as jest.Mock).mockReturnValue(of({ result: { content: [] } }))
      jest.spyOn(component, 'updateCourseData').mockImplementation(() => {})
      const roleCheck = (roles: string[]) => roles?.some(r => r.toLowerCase() === 'doctor')
      ;(component as any).handleCompetencyFlow('org1', roleCheck)
      expect(mockContentSvc.getCouseByContentSearch).toHaveBeenCalled()
    })

    it('should process SEARCH_PLAYLIST and set base query', () => {
      component['plyLsData'] = [{
        orgId: 'org1', role: ['doctor'],
        playlistId: 'SEARCH_PLAYLIST',
        dataSource: { payload: { request: { filters: { sourceName: ['Src'] } } } },
      }, {
        orgId: 'org1', role: ['doctor'],
        playlistId: 'COMPETENCY_PLAYLIST',
        dataSource: { payload: [{
          comp1: { id: 'C1', additionalProperties: { competencyLevelDescription: [{ level: 1 }] } },
        }] },
      }]
      ;(mockContentSvc.getCouseByContentSearch as jest.Mock).mockReturnValue(of({ result: { content: [] } }))
      jest.spyOn(component, 'updateCourseData').mockImplementation(() => {})
      const roleCheck = (roles: string[]) => roles?.some(r => r.toLowerCase() === 'doctor')
      ;(component as any).handleCompetencyFlow('org1', roleCheck)
      expect(mockContentSvc.getCouseByContentSearch).toHaveBeenCalled()
    })

    it('should run filter callback on userEnrollCourse items (lines 141-142)', () => {
      component.userEnrollCourse = [
        { content: { identifier: 'c1', competency: null } },
        { content: { identifier: 'c2', competency: ['comp'] } },
        { content: {} },
      ]
      component['plyLsData'] = []
      ;(component as any).handleCompetencyFlow('org1', () => false)
      expect(component.isLoading()).toBe(false)
    })

    it('should set coursesForYou and call updateCourseData after subscribe', () => {
      const competencyPayload = [{
        comp1: { id: 'C1', additionalProperties: { competencyLevelDescription: [{ level: 1 }] } },
      }]
      component['plyLsData'] = [{
        orgId: 'org1', role: ['doctor'],
        playlistId: 'COMPETENCY_PLAYLIST',
        dataSource: { payload: competencyPayload },
      }]
      ;(mockContentSvc.getCouseByContentSearch as jest.Mock).mockReturnValue(of({ result: { content: [] } }))
      const updateSpy = jest.spyOn(component, 'updateCourseData').mockImplementation(() => {})
      const roleCheck = (roles: string[]) => roles?.some(r => r.toLowerCase() === 'doctor')
      ;(component as any).handleCompetencyFlow('org1', roleCheck)
      expect(updateSpy).toHaveBeenCalled()
    })

    it('covers filter and map callbacks on line 177 when coursesForYou is non-empty', () => {
      const competencyPayload = [{
        comp1: { id: 'C1', additionalProperties: { competencyLevelDescription: [{ level: 1 }] } },
      }]
      component['plyLsData'] = [{
        orgId: 'org1', role: ['doctor'],
        playlistId: 'COMPETENCY_PLAYLIST',
        dataSource: { payload: competencyPayload },
      }]
      ;(mockContentSvc.getCouseByContentSearch as jest.Mock).mockReturnValue(of({ result: { content: [{ identifier: 'c1' }] } }))
      jest.spyOn(component, 'processRecommendedCourses').mockReturnValue([{ identifier: 'c1' }] as any)
      jest.spyOn(component, 'updateCourseData').mockImplementation(() => {})
      const roleCheck = (roles: string[]) => roles?.some(r => r.toLowerCase() === 'doctor')
      ;(component as any).handleCompetencyFlow('org1', roleCheck)
      expect(component.yourPlansCourseIdentifier).toEqual(['c1'])
    })
  })

  // ─── fetchEnvironmentConfigurations internals ─────────────────────────────

  describe('fetchEnvironmentConfigurations', () => {
    it('should set topCertifiedCourse and cneCourse from API response', done => {
      component['topCertifiedCourseIdentifier'] = ['top1']
      component['cneCoursesIdentifier'] = ['cne1']
      ;(mockOrgService.getTopLiveSearchResults as jest.Mock).mockReturnValue(of({
        result: { content: [
          { identifier: 'top1', name: 'Top Course' },
          { identifier: 'cne1', name: 'CNE Course' },
        ] },
      }))
      // Verify signal state inside the mock — called after all signal.set() calls
      jest.spyOn(component, 'updateCourseData').mockImplementation(() => {
        expect(component.topCertifiedCourse()).toHaveLength(1)
        expect(component.cneCourse()).toHaveLength(1)
        done()
      })
      ;(component as any).fetchEnvironmentConfigurations()
    })

    it('should set isLoading false via setTimeout when content is empty', () => {
      jest.useFakeTimers()
      ;(mockOrgService.getTopLiveSearchResults as jest.Mock).mockReturnValue(of({ result: { content: [] } }))
      ;(component as any).fetchEnvironmentConfigurations()
      jest.runAllTimers()
      expect(component.isLoading()).toBe(false)
      jest.useRealTimers()
    })

    it('should use defaultIds (top+cne) when unMappedUser is null', () => {
      ;(mockConfigSvc as any).unMappedUser = null
      component['topCertifiedCourseIdentifier'] = ['top1']
      component['cneCoursesIdentifier'] = ['cne1']
      ;(mockOrgService.getTopLiveSearchResults as jest.Mock).mockReturnValue(of({ result: { content: [] } }))
      ;(component as any).fetchEnvironmentConfigurations()
      expect(mockOrgService.getTopLiveSearchResults).toHaveBeenCalledWith(
        expect.arrayContaining(['top1', 'cne1']),
        'en',
      )
    })

    it('should include yourPlans and featured identifiers when unMappedUser is set', () => {
      ;(mockConfigSvc as any).unMappedUser = { id: 'u1' }
      component['topCertifiedCourseIdentifier'] = ['top1']
      component['yourPlansCourseIdentifier'] = ['plan1']
      ;(mockOrgService.getTopLiveSearchResults as jest.Mock).mockReturnValue(of({ result: { content: [] } }))
      ;(component as any).fetchEnvironmentConfigurations()
      expect(mockOrgService.getTopLiveSearchResults).toHaveBeenCalledWith(
        expect.arrayContaining(['top1', 'plan1']),
        'en',
      )
    })
  })
})
