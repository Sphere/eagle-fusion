import { HttpClient } from '@angular/common/http'
import { ChangeDetectorRef } from '@angular/core'
import { Router } from '@angular/router'
import { of } from 'rxjs'
import { OrgServiceService } from './../../org-service.service'
import { ConfigurationsService, ValueService, LoggerService } from '@ws-widget/utils'

jest.mock('@ws-widget/collection', () => ({
  WidgetUserService: class MockWidgetUserService {
    fetchUserBatchList = jest.fn().mockReturnValue(of([]))
  },
}))

import { WidgetUserService } from '@ws-widget/collection'
import { OrgSelectiveCourseComponent } from './org-selective-course.component'

const mockHttp: Partial<HttpClient> = {
  get: jest.fn().mockReturnValue(of({ states: [] })),
}

const mockOrgService: Partial<OrgServiceService> = {
  getSearchResultsV7ById: jest.fn().mockReturnValue(of({ result: { content: [] } })),
}

const mockConfigSvc: Partial<ConfigurationsService> = {
  userProfile: null,
  orgSelectiveCourseConfig: null,
}

const mockValueSvc: Partial<ValueService> = {
  isXSmall$: of(false) as any,
}

const mockRouter: Partial<Router> = {
  navigateByUrl: jest.fn(),
}

const mockLogger: Partial<LoggerService> = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

const mockCdr: Partial<ChangeDetectorRef> = {
  detectChanges: jest.fn(),
}

const mockUserSvc = new WidgetUserService()

function createComponent(): OrgSelectiveCourseComponent {
  return new OrgSelectiveCourseComponent(
    mockHttp as HttpClient,
    mockOrgService as OrgServiceService,
    mockConfigSvc as ConfigurationsService,
    mockValueSvc as ValueService,
    mockUserSvc as any,
    mockRouter as Router,
    mockLogger as LoggerService,
    mockCdr as ChangeDetectorRef,
  )
}

describe('OrgSelectiveCourseComponent', () => {
  let component: OrgSelectiveCourseComponent

  beforeEach(() => {
    jest.clearAllMocks()
    ;(mockOrgService.getSearchResultsV7ById as jest.Mock).mockReturnValue(of({ result: { content: [] } }))
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('sanitizeId', () => {
    it('replaces non-alphanumeric characters with hyphens and lowercases', () => {
      expect(component.sanitizeId('III & IV Sem')).toBe('iii---iv-sem')
    })
  })

  describe('buildSemesterWiseData', () => {
    it('maps course ids to loaded course objects and drops ids with no match', () => {
      component.courseData = [
        { identifier: 'c1', name: 'Course 1' },
        { identifier: 'c2', name: 'Course 2' },
      ]

      component.buildSemesterWiseData([
        { name: 'Sem 1', courses: ['c1', 'missing'] },
        { name: 'Sem 2', courses: ['c2'] },
      ])

      expect(component.semesterData).toHaveLength(2)
      // 'missing' is silently dropped by .filter(Boolean)
      expect(component.semesterData[0].courses).toHaveLength(1)
      expect(component.semesterData[0].courses[0].identifier).toBe('c1')
      expect(component.semesterData[1].courses).toHaveLength(1)
      expect(component.semesterData[1].courses[0].identifier).toBe('c2')
    })
  })

  describe('handleOrgData', () => {
    it('enriches fetched courses with completionPercentage and builds semester data', () => {
      ;(mockOrgService.getSearchResultsV7ById as jest.Mock).mockReturnValue(
        of({ result: { content: [{ identifier: 'c1', name: 'C1' }, { identifier: 'c2', name: 'C2' }] } })
      )

      const org = {
        orgName: 'Test Org',
        semesters: [{ name: 'Sem 1', courses: ['c1', 'c2'] }],
      }
      const userCourses = [{ courseId: 'c1', completionPercentage: 50 }]

      ;(component as any).handleOrgData(org, userCourses)

      expect(mockOrgService.getSearchResultsV7ById).toHaveBeenCalledWith(['c1', 'c2'])
      expect(component.courseData).toHaveLength(2)
      expect(component.courseData.find(c => c.identifier === 'c1').completionPercentage).toBe(50)
      // course with no user progress defaults to 0, not dropped
      expect(component.courseData.find(c => c.identifier === 'c2').completionPercentage).toBe(0)
      expect(component.semesterData[0].courses).toHaveLength(2)
      expect(component.isLoading).toBe(false)
    })

    it('bails out without calling search when the org has no course ids', () => {
      const org = { orgName: 'Empty Org', semesters: [{ name: 'Sem 1', courses: [] }] }

      ;(component as any).handleOrgData(org, [])

      expect(mockOrgService.getSearchResultsV7ById).not.toHaveBeenCalled()
      expect(component.isLoading).toBe(false)
    })
  })

  describe('getContinueLearningCourses', () => {
    it('returns an empty list when the user is not logged in', () => {
      component.isLoggedIn = false
      component.courseData = [{ identifier: 'c1', completionPercentage: 50 }]

      expect(component.getContinueLearningCourses()).toEqual([])
    })

    it('returns only in-progress courses (0 < completion < 100) when logged in', () => {
      component.isLoggedIn = true
      component.courseData = [
        { identifier: 'c1', completionPercentage: 50 },
        { identifier: 'c2', completionPercentage: 100 },
        { identifier: 'c3', completionPercentage: 0 },
      ]

      const result = component.getContinueLearningCourses()

      expect(result).toHaveLength(1)
      expect(result[0].identifier).toBe('c1')
    })
  })
})
