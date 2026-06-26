jest.mock('../leadership-dashboard-info/leadership-dashboard-info.component', () => ({
  LeadershipDashboardInfoComponent: class {},
}))

jest.mock('../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service', () => ({
  UserProfileService: class {
    getLeaderBoardData = jest.fn()
  },
}))

jest.mock('../../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {
    userProfile = { userId: 'user-123' }
    unMappedUser = {
      rootOrgId: 'org-1',
      profileDetails: {
        profileReq: {
          professionalDetails: [{ designation: 'Doctor', instituteName: 'AIIMS' }],
        },
      },
    }
  },
  LoggerService: class {
    log = jest.fn()
    error = jest.fn()
  },
}))

import { of, throwError } from 'rxjs'
import { LeadershipDashboardComponent } from './leadership-dashboard.component'

describe('LeadershipDashboardComponent', () => {
  let component: LeadershipDashboardComponent
  let mockData: any
  let mockDialogRef: any
  let mockDialog: any
  let mockUserProfileSvc: any
  let mockConfigSvc: any
  let mockLogger: any

  beforeEach(() => {
    mockData = {
      leaderboardData: [
        { userId: 'u1', points: 100, rank: 1 },
        { userId: 'u2', points: 80, rank: 2 },
        { userId: 'u3', points: 60, rank: 3 },
        { userId: 'u4', points: 40, rank: 4 },
      ],
      currentUser: { userId: 'u1', points: 100 },
    }
    mockDialogRef = { close: jest.fn() }
    mockDialog = { open: jest.fn() }
    mockUserProfileSvc = {
      getLeaderBoardData: jest.fn().mockReturnValue(of({
        result: { content: { leaderboardList: [] } },
      })),
    }
    mockConfigSvc = {
      userProfile: { userId: 'user-123' },
      unMappedUser: {
        rootOrgId: 'org-1',
        profileDetails: {
          profileReq: {
            professionalDetails: [{ designation: 'Doctor', instituteName: 'AIIMS' }],
          },
        },
      },
    }
    mockLogger = { log: jest.fn(), error: jest.fn() }

    component = new LeadershipDashboardComponent(
      mockData,
      mockDialogRef,
      mockDialog,
      mockUserProfileSvc,
      mockConfigSvc,
      mockLogger,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default loading to true', () => {
    expect(component.loading).toBe(true)
  })

  it('should populate leaderboardData from dialog data on ngOnInit', () => {
    component.ngOnInit()
    expect(component.leaderboardData).toHaveLength(4)
  })

  it('should set currentUser from dialog data on ngOnInit', () => {
    component.ngOnInit()
    expect(component.currentUser).toEqual(mockData.currentUser)
    expect(component.currentUserId).toBe('u1')
  })

  it('should split leaderboard into topThree and restUsers', () => {
    component.ngOnInit()
    expect(component.topThree).toHaveLength(3)
    expect(component.restUsers).toHaveLength(1)
  })

  it('should set loading false after setUserList', () => {
    component.ngOnInit()
    expect(component.loading).toBe(false)
  })

  describe('setUserList', () => {
    it('should set maxPoints from first entry', () => {
      component.leaderboardData = [
        { points: 150, rank: 1 }, { points: 100, rank: 2 },
      ]
      component.setUserList()
      expect(component.maxPoints).toBe(150)
    })

    it('should default maxPoints to 1 when leaderboardData is empty', () => {
      component.leaderboardData = []
      component.setUserList()
      expect(component.maxPoints).toBe(1)
    })
  })

  describe('getBarHeight', () => {
    it('should return a string ending in "px"', () => {
      component.maxPoints = 100
      const height = component.getBarHeight(80, 1)
      expect(height).toMatch(/px$/)
    })

    it('should return higher px value for higher points', () => {
      component.maxPoints = 100
      const h1 = parseInt(component.getBarHeight(100, 1))
      const h2 = parseInt(component.getBarHeight(50, 1))
      expect(h1).toBeGreaterThan(h2)
    })
  })

  describe('getTopThreeForDisplay', () => {
    it('should return empty array when topThree is empty', () => {
      component.topThree = []
      expect(component.getTopThreeForDisplay()).toEqual([])
    })

    it('should return display-order array [rank3, rank1, rank2]', () => {
      component.topThree = [
        { rank: 1, name: 'A' },
        { rank: 2, name: 'B' },
        { rank: 3, name: 'C' },
      ]
      const result = component.getTopThreeForDisplay()
      expect(result[0]).toMatchObject({ rank: 3 })
      expect(result[1]).toMatchObject({ rank: 1 })
      expect(result[2]).toMatchObject({ rank: 2 })
    })
  })

  describe('closeLeaderboard', () => {
    it('should close the dialog', () => {
      component.closeLeaderboard()
      expect(mockDialogRef.close).toHaveBeenCalled()
    })
  })

  describe('loadMore', () => {
    it('should not increment page when infiniteDisabled', () => {
      component.infiniteDisabled = true
      component.currentPage = 0
      component.loadMore()
      expect(component.currentPage).toBe(0)
    })

    it('should not load more when loading is true', () => {
      component.loading = true
      component.currentPage = 0
      component.loadMore()
      expect(component.currentPage).toBe(0)
    })

    it('should increment page and call loadLeaderboard when not disabled and not loading', () => {
      component.infiniteDisabled = false
      component.loading = false
      component.currentPage = 0
      mockUserProfileSvc.getLeaderBoardData.mockReturnValue(of({
        result: { content: { leaderboardList: [] } },
      }))
      component.loadMore()
      expect(component.currentPage).toBe(1)
      expect(mockUserProfileSvc.getLeaderBoardData).toHaveBeenCalled()
    })
  })

  describe('loadLeaderboard', () => {
    it('should set loading to true on reset and false after success', () => {
      mockUserProfileSvc.getLeaderBoardData.mockReturnValue(of({
        result: { content: { leaderboardList: [{ userId: 'u5', points: 20, rank: 5 }] } },
      }))
      component.loadLeaderboard(true)
      expect(component.loading).toBe(false)
    })

    it('should append results to restUsers', () => {
      const newUsers = [{ userId: 'u5', points: 20, rank: 5 }]
      mockUserProfileSvc.getLeaderBoardData.mockReturnValue(of({
        result: { content: { leaderboardList: newUsers } },
      }))
      component.restUsers = []
      component.loadLeaderboard(false)
      expect(component.restUsers).toHaveLength(1)
    })

    it('should set infiniteDisabled when returned list is smaller than pageSize', () => {
      mockUserProfileSvc.getLeaderBoardData.mockReturnValue(of({
        result: { content: { leaderboardList: [{ userId: 'u5' }] } },
      }))
      component.loadLeaderboard(false)
      expect(component.infiniteDisabled).toBe(true)
    })

    it('should set loading false and infiniteDisabled true on error', () => {
      const { throwError } = require('rxjs')
      mockUserProfileSvc.getLeaderBoardData.mockReturnValue(throwError(() => new Error('fail')))
      component.loadLeaderboard(false)
      expect(component.loading).toBe(false)
      expect(component.infiniteDisabled).toBe(true)
    })
  })

  describe('openInfoPopup', () => {
    it('should open dialog with LeadershipDashboardInfoComponent', () => {
      component.openInfoPopup()
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ width: '100%', panelClass: 'congratulations-dialog' }),
      )
    })
  })

  describe('evaluatePinState', () => {
    it('should set isPinnedVisible true when rows is empty and currentUser exists', () => {
      component['rows'] = { length: 0, toArray: jest.fn().mockReturnValue([]) } as any
      component.currentUser = { userId: 'u1' }
      component.evaluatePinState()
      expect(component.isPinnedVisible).toBe(true)
    })

    it('should set isPinnedVisible true when user not in restUsers', () => {
      component['rows'] = { length: 1, toArray: jest.fn().mockReturnValue([{ nativeElement: {} }]) } as any
      component.restUsers = [{ userId: 'other' }]
      component.currentUserId = 'u1'
      component.evaluatePinState()
      expect(component.isPinnedVisible).toBe(true)
    })

    it('should set isPinnedVisible based on row rect when user is found in restUsers', () => {
      const mockRect = { top: 9999 }
      const mockEl = { nativeElement: { getBoundingClientRect: jest.fn().mockReturnValue(mockRect) } }
      component['rows'] = { length: 1, toArray: jest.fn().mockReturnValue([mockEl]) } as any
      component.restUsers = [{ userId: 'u1' }]
      component.currentUserId = 'u1'
      component.evaluatePinState()
      expect(component.isPinnedVisible).toBe(true)
    })
  })

  describe('onScroll / evaluatePinOnScroll', () => {
    it('onScroll should call evaluatePinOnScroll', () => {
      const spy = jest.spyOn(component, 'evaluatePinOnScroll')
      component.onScroll()
      expect(spy).toHaveBeenCalled()
    })

    it('evaluatePinOnScroll should set isPinnedVisible true when rows empty', () => {
      component['rows'] = { length: 0, toArray: jest.fn().mockReturnValue([]) } as any
      component.evaluatePinOnScroll()
      expect(component.isPinnedVisible).toBe(true)
    })

    it('evaluatePinOnScroll should set isPinnedVisible true when user not in restUsers', () => {
      component['rows'] = { length: 1, toArray: jest.fn().mockReturnValue([{}]) } as any
      component.restUsers = [{ userId: 'other' }]
      component.currentUserId = 'u1'
      component.evaluatePinOnScroll()
      expect(component.isPinnedVisible).toBe(true)
    })

    it('evaluatePinOnScroll should check rect when user row is found', () => {
      const mockRect = { top: 5 }
      const mockEl = { nativeElement: { getBoundingClientRect: jest.fn().mockReturnValue(mockRect) } }
      component['rows'] = { length: 1, toArray: jest.fn().mockReturnValue([mockEl]) } as any
      component.restUsers = [{ userId: 'u1' }]
      component.currentUserId = 'u1'
      component.evaluatePinOnScroll()
      expect(component.isPinnedVisible).toBe(false)
    })
  })

  describe('ngAfterViewInit', () => {
    it('should subscribe to rows.changes and call evaluatePinState after timeout', () => {
      jest.useFakeTimers()
      const subscribeCallback = jest.fn()
      component['rows'] = { changes: { subscribe: jest.fn((cb: any) => cb()) }, length: 0, toArray: jest.fn().mockReturnValue([]) } as any
      component.currentUser = { userId: 'u1' }
      jest.spyOn(component, 'setupInfiniteScroll').mockImplementation(() => {})
      component.ngAfterViewInit()
      expect(component['rows'].changes.subscribe).toHaveBeenCalled()
      jest.advanceTimersByTime(400)
      jest.useRealTimers()
    })
  })

  describe('setupInfiniteScroll', () => {
    it('should not throw when scrollTrigger is not set', () => {
      component.scrollTrigger = undefined as any
      expect(() => component.setupInfiniteScroll()).not.toThrow()
    })

    it('should create and start IntersectionObserver when scrollTrigger is set', () => {
      const observeMock = jest.fn()
      const disconnectMock = jest.fn()
      const mockObserver = { observe: observeMock, disconnect: disconnectMock }
      ;(global as any).IntersectionObserver = jest.fn().mockImplementation((cb: any) => {
        cb([{ isIntersecting: true }])
        return mockObserver
      })
      component.scrollTrigger = { nativeElement: document.createElement('div') } as any
      component.infiniteDisabled = false
      component.loading = false
      jest.spyOn(component, 'loadMore').mockImplementation(() => {})
      component.setupInfiniteScroll()
      expect(observeMock).toHaveBeenCalled()
    })
  })

  describe('ngOnDestroy', () => {
    it('should disconnect intersectionObserver if it exists', () => {
      const disconnectMock = jest.fn()
      component['intersectionObserver'] = { disconnect: disconnectMock } as any
      component.ngOnDestroy()
      expect(disconnectMock).toHaveBeenCalled()
    })

    it('should not throw when intersectionObserver is not set', () => {
      component['intersectionObserver'] = undefined as any
      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })
})
