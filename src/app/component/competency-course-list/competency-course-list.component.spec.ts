jest.mock('@angular/core', () => ({
  ...jest.requireActual('@angular/core'),
  effect: (fn: any) => { fn(); return {} },
}))

jest.mock('@ws-widget/utils', () => ({
  ConfigurationsService: class {
    userProfile: any = { userId: 'u1', rootOrgId: 'org1', language: 'hi' }
  },
  ValueService: class {
    isMobile = jest.fn().mockReturnValue(false)
  },
}))

import { of, throwError } from 'rxjs'
import { SimpleChange } from '@angular/core'
import { CompetencyCourseListComponent } from './competency-course-list.component'
import { CompetencyUserService } from './services/competency-user.service'
import { ConfigurationsService, ValueService } from '@ws-widget/utils'

describe('CompetencyCourseListComponent', () => {
  let comp: CompetencyCourseListComponent
  let mockConfigSvc: any
  let mockValueSvc: any
  let mockDashboardSvc: any
  let userSvc: CompetencyUserService

  const ashaResult = {
    ashaData: [{ contentId: 'c1' }],
    completedCourses: [{ contentId: 'done' }],
    inProgressCourses: [{ contentId: 'c1' }],
  }

  beforeEach(() => {
    mockConfigSvc = new (ConfigurationsService as any)()
    mockValueSvc = new (ValueService as any)()
    mockDashboardSvc = {
      getCompetencyInfo: jest.fn().mockReturnValue({
        competencyIds: ['1'],
        competencyLevels: [{ competencyId: 1, level: 1 }],
        isUserDesignationInRoles: true,
      }),
      getAshaData: jest.fn().mockReturnValue(of(ashaResult)),
    }
    userSvc = new CompetencyUserService()
    comp = new CompetencyCourseListComponent(mockConfigSvc, mockValueSvc, mockDashboardSvc, userSvc)
    comp.playlists = [{ playlistId: 'COMPETENCY_PLAYLIST' }]
    comp.designation = 'ASHA'
  })

  afterEach(() => {
    comp.ngOnDestroy()
    jest.clearAllMocks()
  })

  it('should create with isTablet derived from ValueService', () => {
    expect(comp).toBeTruthy()
    expect(comp.isTablet()).toBe(true)
  })

  describe('ngOnInit', () => {
    it('sets language from the user profile and loads data when autoInit is true', () => {
      const initSpy = jest.spyOn(comp, 'initData')
      comp.ngOnInit()
      expect(comp.defaultLang).toBe('hi')
      expect(initSpy).toHaveBeenCalled()
    })

    it('defaults language to en when the profile has none', () => {
      mockConfigSvc.userProfile = { userId: 'u1' }
      comp.ngOnInit()
      expect(comp.defaultLang).toBe('en')
    })

    it('does not load data when autoInit is false', () => {
      const initSpy = jest.spyOn(comp, 'initData')
      comp.autoInit = false
      comp.ngOnInit()
      expect(initSpy).not.toHaveBeenCalled()
    })

    it('reloads data with the new language when a profile update is emitted', () => {
      jest.useFakeTimers()
      comp.ngOnInit()
      const initSpy = jest.spyOn(comp, 'initData')
      userSvc.emitProfileUpdate({ language: 'ta' })
      jest.advanceTimersByTime(300)
      expect(comp.defaultLang).toBe('ta')
      expect(initSpy).toHaveBeenCalled()
      jest.useRealTimers()
    })

    it('keeps the current language when the update carries none', () => {
      jest.useFakeTimers()
      comp.ngOnInit()
      userSvc.emitProfileUpdate({ userId: 'u1' })
      jest.advanceTimersByTime(300)
      expect(comp.defaultLang).toBe('hi')
      jest.useRealTimers()
    })
  })

  describe('ngOnChanges', () => {
    it('reloads data when playlists change after the first change', () => {
      const initSpy = jest.spyOn(comp, 'initData')
      comp.ngOnChanges({ playlists: new SimpleChange([], comp.playlists, false) })
      expect(initSpy).toHaveBeenCalled()
    })

    it('ignores the first change and empty playlists', () => {
      const initSpy = jest.spyOn(comp, 'initData')
      comp.ngOnChanges({ playlists: new SimpleChange(undefined, comp.playlists, true) })
      comp.playlists = []
      comp.ngOnChanges({ playlists: new SimpleChange([], [], false) })
      expect(initSpy).not.toHaveBeenCalled()
    })
  })

  describe('initData', () => {
    it('populates the signals from the dashboard service', () => {
      comp.ngOnInit()
      expect(mockDashboardSvc.getCompetencyInfo).toHaveBeenCalledWith(comp.playlists, 'org1', 'ASHA')
      expect(mockDashboardSvc.getAshaData).toHaveBeenCalledWith('hi', [{ competencyId: 1, level: 1 }], ['1'], 'u1')
      expect(comp.ashaData()).toEqual(ashaResult.ashaData)
      expect(comp.completedCourses()).toEqual(ashaResult.completedCourses)
      expect(comp.inProgressCourses()).toEqual(ashaResult.inProgressCourses)
      expect(comp.isLoading()).toBe(false)
      expect(comp.competencyRoles).toBe(true)
    })

    it('returns empty lists without fetching when competency info is null', () => {
      mockDashboardSvc.getCompetencyInfo.mockReturnValue(null)
      comp.ngOnInit()
      expect(mockDashboardSvc.getAshaData).not.toHaveBeenCalled()
      expect(comp.ashaData()).toEqual([])
      expect(comp.isLoading()).toBe(false)
    })

    it('resolves competency info from an empty list when there are no playlists', () => {
      mockDashboardSvc.getCompetencyInfo.mockReturnValue(null)
      comp.playlists = []
      comp.ngOnInit()
      expect(comp.showanmHome).toBe(false)
      expect(mockDashboardSvc.getCompetencyInfo).toHaveBeenCalledWith([], 'org1', 'ASHA')
      expect(comp.ashaData()).toEqual([])
    })

    it('clears the loading flag when the fetch errors', () => {
      mockDashboardSvc.getAshaData.mockReturnValue(throwError(() => new Error('fail')))
      comp.ngOnInit()
      expect(comp.isLoading()).toBe(false)
    })
  })

  describe('getVisibleCourses', () => {
    const courses = [1, 2, 3, 4, 5, 6, 7].map(i => ({ contentId: `c${i}` }))

    beforeEach(() => {
      comp.inProgressCourses.set(courses)
    })

    it('returns everything when showAllCourses is on', () => {
      comp.showAllCourses.set(true)
      expect(comp.getVisibleCourses()).toHaveLength(7)
    })

    it('returns four courses on mobile', () => {
      comp.isTablet.set(false)
      expect(comp.getVisibleCourses()).toHaveLength(4)
    })

    it('returns five courses on tablet when no tabCardCount is configured', () => {
      comp.isTablet.set(true)
      comp.section = {}
      expect(comp.getVisibleCourses()).toHaveLength(5)
    })

    it('uses tabCardCount when completed courses exist', () => {
      comp.isTablet.set(true)
      comp.section = { tabCardCount: 3 }
      comp.completedCourses.set([{ contentId: 'done' }])
      expect(comp.getVisibleCourses()).toHaveLength(3)
    })

    it('uses tabCardCount + 1 when there are no completed courses', () => {
      comp.isTablet.set(true)
      comp.section = { tabCardCount: 3 }
      comp.completedCourses.set([])
      expect(comp.getVisibleCourses()).toHaveLength(4)
    })
  })

  describe('view-all toggle', () => {
    it('shouldShowViewAll is true when courses overflow the visible window', () => {
      comp.isTablet.set(false)
      comp.inProgressCourses.set([1, 2, 3, 4, 5].map(i => ({ contentId: `c${i}` })))
      expect(comp.shouldShowViewAll()).toBe(true)
    })

    it('shouldShowViewAll is false when everything already fits', () => {
      comp.isTablet.set(false)
      comp.inProgressCourses.set([{ contentId: 'c1' }])
      expect(comp.shouldShowViewAll()).toBe(false)
    })

    it('shouldShowViewAll stays true while expanded so the user can collapse', () => {
      comp.inProgressCourses.set([{ contentId: 'c1' }])
      comp.showAllCourses.set(true)
      expect(comp.shouldShowViewAll()).toBe(true)
    })

    it('viewAllCourse toggles showAllCourses', () => {
      comp.viewAllCourse()
      expect(comp.showAllCourses()).toBe(true)
      comp.viewAllCourse()
      expect(comp.showAllCourses()).toBe(false)
    })
  })

  it('trackByCourse returns contentId or the index fallback', () => {
    expect(comp.trackByCourse(0, { contentId: 'c1' })).toBe('c1')
    expect(comp.trackByCourse(3, {})).toBe(3)
  })
})
