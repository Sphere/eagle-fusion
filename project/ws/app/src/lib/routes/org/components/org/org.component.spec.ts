import { ActivatedRoute, Router } from '@angular/router'
import { OrgComponent } from './org.component'
import { BehaviorSubject, of, throwError } from 'rxjs'
import { OrgServiceService } from './../../org-service.service'
import { ConfigurationsService, ValueService, LoggerService } from '@ws-widget/utils'
import { ChangeDetectorRef } from '@angular/core'
import { SeoService } from 'src/app/services/seo.service'
import { UserAgentResolverService } from 'src/app/services/user-agent.service'

jest.mock('@ws-widget/collection', () => ({
  WidgetUserService: class MockWidgetUserService {
    fetchUserBatchList = jest.fn().mockReturnValue(of([]))
  },
}))

import { WidgetUserService } from '@ws-widget/collection'

const queryParamsSubject = new BehaviorSubject<any>({ orgId: 'Indian Nursing Council' })

const mockActivatedRoute = {
  queryParams: queryParamsSubject.asObservable(),
  snapshot: { queryParams: { orgId: 'Indian Nursing Council' } },
}

const mockRouter: Partial<Router> = {
  navigate: jest.fn(),
  navigateByUrl: jest.fn(),
  url: '/',
}

const mockOrgService: Partial<OrgServiceService> = {
  getOrgConfig: jest.fn(),
  getSearchResultsV7ById: jest.fn(),
  getSearchV7Results: jest.fn(),
  hideHeaderFooter: new BehaviorSubject<boolean>(false) as any,
}

const mockConfigSvc: Partial<ConfigurationsService> = {
  userProfile: null,
  unMappedUser: null,
}

const mockValueSvc: Partial<ValueService> = {
  isLtMedium$: of(false) as any,
  isXSmall$: of(false) as any,
}

const mockLogger: Partial<LoggerService> = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

const mockCdr: Partial<ChangeDetectorRef> = {
  detectChanges: jest.fn(),
}

const mockSeoSvc: Partial<SeoService> = {
  update: jest.fn(),
}

const mockUserAgentSvc: Partial<UserAgentResolverService> = {
  requestGeolocation: jest.fn(),
}

let mockUserSvc: any

function createComponent(): OrgComponent {
  return new OrgComponent(
    mockActivatedRoute as unknown as ActivatedRoute,
    mockOrgService as OrgServiceService,
    mockRouter as Router,
    mockConfigSvc as ConfigurationsService,
    mockUserSvc,
    mockValueSvc as ValueService,
    mockLogger as LoggerService,
    mockCdr as ChangeDetectorRef,
    mockSeoSvc as SeoService,
    mockUserAgentSvc as UserAgentResolverService,
  )
}

async function flushMicrotasks() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('OrgComponent', () => {
  let component: OrgComponent

  beforeEach(() => {
    jest.clearAllMocks()
    queryParamsSubject.next({ orgId: 'Indian Nursing Council' })
    mockUserSvc = new (WidgetUserService as any)()
    ;(mockOrgService.getOrgConfig as jest.Mock).mockReturnValue({
      toPromise: () => Promise.resolve({ result: { form: { data: { sources: [] } } } }),
    })
    ;(mockOrgService.getSearchResultsV7ById as jest.Mock).mockReturnValue(of({ result: { content: [] } }))
    ;(mockOrgService.getSearchV7Results as jest.Mock).mockReturnValue(of({ result: { content: [] } }))
    mockConfigSvc.userProfile = null
    mockConfigSvc.unMappedUser = null
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('subscribes to isLtMedium$ and sets isMobile', () => {
      component.ngOnInit()
      expect(component.isMobile).toBe(false)
      expect(mockUserAgentSvc.requestGeolocation).toHaveBeenCalled()
    })

    it('builds the ratingArr up to starCount', () => {
      component.ngOnInit()
      expect(component.ratingArr).toEqual([0, 1, 2, 3, 4])
    })

    it('resets state and stops loading when orgId is blank', async () => {
      queryParamsSubject.next({ orgId: '  ' })
      component.ngOnInit()
      await flushMicrotasks()
      expect(component.orgName).toBe('')
      expect(component.isLoading).toBe(false)
    })

    it('loads org data when orgId is present', async () => {
      ;(mockOrgService.getOrgConfig as jest.Mock).mockReturnValue({
        toPromise: () => Promise.resolve({
          result: { form: { data: { sources: [{ sourceName: 'Indian Nursing Council', about: 'Hello', sections: [] }] } } },
        }),
      })
      component.ngOnInit()
      await flushMicrotasks()
      expect(component.currentOrgData).toBeTruthy()
      expect(mockSeoSvc.update).toHaveBeenCalled()
    })
  })

  describe('loadOrgData via ngOnInit', () => {
    it('stops loading when no matching source is found', async () => {
      ;(mockOrgService.getOrgConfig as jest.Mock).mockReturnValue({
        toPromise: () => Promise.resolve({ result: { form: { data: { sources: [{ sourceName: 'Other Org' }] } } } }),
      })
      component.ngOnInit()
      await flushMicrotasks()
      expect(component.currentOrgData).toBeUndefined()
      expect(component.isLoading).toBe(false)
    })

    it('handles a getOrgConfig rejection gracefully', async () => {
      ;(mockOrgService.getOrgConfig as jest.Mock).mockReturnValue({
        toPromise: () => Promise.reject(new Error('network error')),
      })
      component.ngOnInit()
      await flushMicrotasks()
      expect(component.isLoading).toBe(false)
      expect(mockLogger.error).toHaveBeenCalled()
    })

    it('sets btnText to Login when there is no unMappedUser', async () => {
      mockConfigSvc.unMappedUser = null
      ;(mockOrgService.getOrgConfig as jest.Mock).mockReturnValue({
        toPromise: () => Promise.resolve({ result: { form: { data: { sources: [{ sourceName: 'Indian Nursing Council', sections: [] }] } } } }),
      })
      component.ngOnInit()
      await flushMicrotasks()
      expect(component.btnText).toBe('Login')
    })

    it('sets btnText to View Course when unMappedUser exists', async () => {
      mockConfigSvc.unMappedUser = { id: 'u1' } as any
      ;(mockOrgService.getOrgConfig as jest.Mock).mockReturnValue({
        toPromise: () => Promise.resolve({ result: { form: { data: { sources: [{ sourceName: 'Indian Nursing Council', sections: [] }] } } } }),
      })
      component.ngOnInit()
      await flushMicrotasks()
      expect(component.btnText).toBe('View Course')
    })

    it('builds orgSections for courseGroup/courseList/continueLearning/completed and computes competency_offered', async () => {
      mockConfigSvc.userProfile = { userId: 'user-1' } as any
      ;(mockOrgService.getOrgConfig as jest.Mock).mockReturnValue({
        toPromise: () => Promise.resolve({
          result: {
            form: {
              data: {
                sources: [{
                  sourceName: 'Indian Nursing Council',
                  about: 'About text',
                  sections: [
                    { sectionType: 'continueLearning', title: 'Continue Learning' },
                    { sectionType: 'completed', title: 'Completed' },
                    { sectionType: 'courseGroup', title: 'Group', courseIds: ['c1', 'c2'], hideCourse: ['c2'] },
                    { sectionType: 'courseList', title: 'List', courseIds: ['c3'] },
                  ],
                }],
              },
            },
          },
        }),
      })
      ;(mockOrgService.getSearchResultsV7ById as jest.Mock).mockReturnValue(of({
        result: {
          content: [
            { identifier: 'c1', competencies_v1: JSON.stringify([{ competencyId: 'comp1', competencyName: 'Comp 1', level: 2 }]) },
            { identifier: 'c3' },
          ],
        },
      }))
      mockUserSvc.fetchUserBatchList.mockReturnValue(of([
        { content: { identifier: 'c1' }, completionPercentage: 40 },
      ]))

      component.ngOnInit()
      await flushMicrotasks()
      await flushMicrotasks()

      expect(component.orgSections.length).toBe(4)
      const continueLearning = component.orgSections.find(s => s.config.sectionType === 'continueLearning')!
      expect(continueLearning.courses.length).toBe(1)
      const courseGroup = component.orgSections.find(s => s.config.sectionType === 'courseGroup')!
      expect(courseGroup.courses.map((c: any) => c.identifier)).toEqual([])
      expect(component.competencyData.length).toBe(1)
      expect(component.competency_offered).toBe(1)
    })

    it('marks completed courses when completionPercentage is 100', async () => {
      mockConfigSvc.userProfile = { userId: 'user-1' } as any
      ;(mockOrgService.getOrgConfig as jest.Mock).mockReturnValue({
        toPromise: () => Promise.resolve({
          result: {
            form: {
              data: {
                sources: [{
                  sourceName: 'Indian Nursing Council',
                  sections: [
                    { sectionType: 'completed', title: 'Completed' },
                    { sectionType: 'courseGroup', title: 'Group', courseIds: ['c1'] },
                  ],
                }],
              },
            },
          },
        }),
      })
      ;(mockOrgService.getSearchResultsV7ById as jest.Mock).mockReturnValue(of({ result: { content: [{ identifier: 'c1' }] } }))
      mockUserSvc.fetchUserBatchList.mockReturnValue(of([
        { content: { identifier: 'c1' }, completionPercentage: 100 },
      ]))

      component.ngOnInit()
      await flushMicrotasks()
      await flushMicrotasks()

      const completed = component.orgSections.find(s => s.config.sectionType === 'completed')!
      expect(completed.courses.length).toBe(1)
      const courseGroup = component.orgSections.find(s => s.config.sectionType === 'courseGroup')!
      expect(courseGroup.courses).toEqual([])
    })

    it('pre-populates and later merges tagSearch sections', async () => {
      ;(mockOrgService.getOrgConfig as jest.Mock).mockReturnValue({
        toPromise: () => Promise.resolve({
          result: {
            form: {
              data: {
                sources: [{
                  sourceName: 'Indian Nursing Council',
                  sections: [
                    { sectionType: 'tagSearch', title: 'Tagged', taggedSourceName: 'Other Source' },
                  ],
                }],
              },
            },
          },
        }),
      })
      ;(mockOrgService.getSearchV7Results as jest.Mock).mockReturnValue(of({
        result: {
          content: [
            { identifier: 'tag-1', sourceName: 'Indian Nursing Council' },
            { identifier: 'tag-2', sourceName: 'Excluded Source' },
          ],
        },
      }))

      component.ngOnInit()
      await flushMicrotasks()
      await flushMicrotasks()
      await flushMicrotasks()

      const tagSection = component.orgSections.find(s => s.config.sectionType === 'tagSearch')!
      expect(tagSection).toBeTruthy()
      expect(tagSection.courses.map((c: any) => c.identifier)).toEqual(['tag-1'])
      expect(mockOrgService.getSearchV7Results).toHaveBeenCalledWith(['Indian Nursing Council', 'Other Source'])
    })

    it('skips sections with show === false', async () => {
      ;(mockOrgService.getOrgConfig as jest.Mock).mockReturnValue({
        toPromise: () => Promise.resolve({
          result: {
            form: {
              data: {
                sources: [{
                  sourceName: 'Indian Nursing Council',
                  sections: [
                    { sectionType: 'courseGroup', title: 'Hidden', show: false, courseIds: ['c1'] },
                  ],
                }],
              },
            },
          },
        }),
      })
      component.ngOnInit()
      await flushMicrotasks()
      await flushMicrotasks()
      expect(component.orgSections.length).toBe(0)
    })

    it('handles an error from the forkJoin subscription', async () => {
      ;(mockOrgService.getOrgConfig as jest.Mock).mockReturnValue({
        toPromise: () => Promise.resolve({
          result: {
            form: {
              data: {
                sources: [{
                  sourceName: 'Indian Nursing Council',
                  sections: [{ sectionType: 'courseGroup', title: 'Group', courseIds: ['c1'] }],
                }],
              },
            },
          },
        }),
      })
      ;(mockOrgService.getSearchResultsV7ById as jest.Mock).mockReturnValue(throwError(() => new Error('boom')))
      component.ngOnInit()
      await flushMicrotasks()
      await flushMicrotasks()
      expect(component.isLoading).toBe(false)
    })
  })

  describe('onPopState', () => {
    it('logs the event and navigates when a stored URL exists', () => {
      sessionStorage.setItem('currentURL', '/some/path')
      component.onPopState({ type: 'popstate' } as any)
      expect(mockLogger.log).toHaveBeenCalled()
      sessionStorage.removeItem('currentURL')
    })

    it('does nothing extra when there is no stored URL', () => {
      sessionStorage.removeItem('currentURL')
      expect(() => component.onPopState({ type: 'popstate' } as any)).not.toThrow()
    })
  })

  describe('totalCourseCount', () => {
    it('sums courses excluding continueLearning/completed sections', () => {
      component.orgSections = [
        { config: { sectionType: 'courseGroup' }, courses: [1, 2], showAll: false } as any,
        { config: { sectionType: 'continueLearning' }, courses: [1, 2, 3], showAll: false } as any,
        { config: { sectionType: 'completed' }, courses: [1], showAll: false } as any,
      ]
      expect(component.totalCourseCount).toBe(2)
    })
  })

  describe('filterByLanguage', () => {
    it('sets selectedLanguage', () => {
      component.filterByLanguage('hi')
      expect(component.selectedLanguage).toBe('hi')
    })
  })

  describe('getFilteredSectionCourses', () => {
    it('returns empty array when courses is falsy', () => {
      expect(component.getFilteredSectionCourses(null as any)).toEqual([])
    })

    it('returns all courses when selectedLanguage is all', () => {
      component.selectedLanguage = 'all'
      const courses = [{ lang: 'en' }, { lang: 'hi' }]
      expect(component.getFilteredSectionCourses(courses)).toEqual(courses)
    })

    it('filters courses by selected language, defaulting missing lang to en', () => {
      component.selectedLanguage = 'en'
      const courses = [{ lang: 'en' }, { lang: 'hi' }, {}]
      expect(component.getFilteredSectionCourses(courses)).toEqual([{ lang: 'en' }, {}])
    })
  })

  describe('getDisplayedItems', () => {
    it('returns all items when showAll is true', () => {
      expect(component.getDisplayedItems([1, 2, 3, 4, 5, 6], true)).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('slices to the limit when not showing all and over the limit', () => {
      expect(component.getDisplayedItems([1, 2, 3, 4, 5, 6], false, 3)).toEqual([1, 2, 3])
    })

    it('returns all items when under the limit', () => {
      expect(component.getDisplayedItems([1, 2], false, 5)).toEqual([1, 2])
    })
  })

  describe('getStarImage', () => {
    it('returns the full star url when index is within the floor of averageRating', () => {
      expect(component.getStarImage(0, 4)).toBe('/fusion-assets/icons/toc_star.png')
    })

    it('returns the half star url for the fractional star position', () => {
      expect(component.getStarImage(3, 3.5)).toBe('/fusion-assets/icons/Half_star1.svg')
    })

    it('returns the empty star url otherwise', () => {
      expect(component.getStarImage(4, 3)).toBe('/fusion-assets/icons/empty_star.png')
    })
  })

  describe('formatAbout', () => {
    it('returns the text unchanged when falsy', () => {
      expect(component.formatAbout('')).toBe('')
    })

    it('replaces newlines, bullets, unicode apostrophe and tabs', () => {
      const result = component.formatAbout('line1\nline2•item\\u2019s\ttab')
      expect(result).toBe('line1<br>line2&bull;item&#8217;s&nbsp;&nbsp;&nbsp;&nbsp;tab')
    })
  })

  describe('add', () => {
    it('adds two numbers', () => {
      expect(component.add(2, 3)).toBe(5)
    })
  })

  describe('redirect', () => {
    it('navigates to the pathname of a stored absolute URL', () => {
      sessionStorage.setItem('currentURL', 'https://sphere.aastrika.org/app/toc/123/overview')
      component.redirect()
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/toc/123/overview')
      sessionStorage.removeItem('currentURL')
    })

    it('navigates to a stored relative URL as-is', () => {
      sessionStorage.setItem('currentURL', '/app/toc/123/overview')
      component.redirect()
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/toc/123/overview')
      sessionStorage.removeItem('currentURL')
    })

    it('falls back to the home page when there is no stored URL', () => {
      sessionStorage.removeItem('currentURL')
      component.redirect()
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/page/home')
    })
  })

  describe('gotoOverview', () => {
    it('stores the current href and navigates to the course overview', () => {
      component.gotoOverview('course-1')
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc/course-1/overview'])
      sessionStorage.removeItem('cURL')
    })
  })

  describe('showMoreCourses', () => {
    it('navigates to the all-courses route with the current orgName', () => {
      component.orgName = 'Indian Nursing Council'
      component.showMoreCourses()
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/org-details/all-courses'], { queryParams: { orgId: 'Indian Nursing Council' } })
    })
  })

  describe('goToLink', () => {
    it('opens the link in a new tab', () => {
      const spy = jest.spyOn(window, 'open').mockImplementation(() => null)
      component.goToLink('https://example.com')
      expect(spy).toHaveBeenCalledWith('https://example.com', '_blank')
      spy.mockRestore()
    })
  })

  describe('showIcon', () => {
    it('returns star when rating is high enough', () => {
      component.rating = 4
      expect(component.showIcon(0)).toBe('star')
    })

    it('returns star_border otherwise', () => {
      component.rating = 1
      expect(component.showIcon(3)).toBe('star_border')
    })
  })

  describe('groupCompetenciesById', () => {
    it('groups competencies by course + competencyId, accumulating levels', () => {
      const courses = [
        {
          identifier: 'c1',
          competencies_v1: JSON.stringify([
            { competencyId: 'comp1', competencyName: 'Comp 1', level: 1 },
            { competencyId: 'comp1', competencyName: 'Comp 1', level: 2 },
          ]),
        },
      ]
      const result = component.groupCompetenciesById(courses)
      expect(result.length).toBe(1)
      expect(result[0].levels).toEqual(['Level 1', 'Level 2'])
    })

    it('skips courses with no competencies_v1', () => {
      expect(component.groupCompetenciesById([{ identifier: 'c1' }])).toEqual([])
    })

    it('handles invalid JSON in competencies_v1 gracefully', () => {
      expect(component.groupCompetenciesById([{ identifier: 'c1', competencies_v1: 'not-json' }])).toEqual([])
    })

    it('skips entries missing competencyId or level', () => {
      const courses = [
        { identifier: 'c1', competencies_v1: JSON.stringify([{ competencyName: 'no id or level' }]) },
      ]
      expect(component.groupCompetenciesById(courses)).toEqual([])
    })
  })

  describe('ngOnDestroy', () => {
    it('unsubscribes and hides the header/footer', () => {
      component.ngOnInit()
      component.ngOnDestroy()
      expect(mockOrgService.hideHeaderFooter!.value).toBe(false)
    })

    it('does not throw when there is no routeSubscription', () => {
      component.routeSubscription = undefined
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})
