import { ReplaySubject, of, throwError } from 'rxjs'
import { UserPreferenceService } from './user-preference.service'
import { API_END_POINTS } from '../../../../../../src/app/constants/apiConstants'

describe('UserPreferenceService', () => {
  let service: UserPreferenceService
  let mockHttp: any
  let configSvc: any

  beforeEach(() => {
    jest.useFakeTimers()
    mockHttp = {
      get: jest.fn().mockReturnValue(of({ selectedLocale: 'en' })),
      put: jest.fn().mockReturnValue(of({ ok: true })),
    }
    configSvc = {
      prefChangeNotifier: new ReplaySubject<any>(1),
      isAuthenticated: true,
      isDarkMode: false,
      isRTL: false,
      completedTour: false,
      activeFontObject: null,
      userPreference: null,
      profileSettings: ['profilePicture'],
    }
    service = new UserPreferenceService(mockHttp, configSvc)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('initialize', () => {
    it('should save a debounced preference change when the user is authenticated', () => {
      const saveSpy = jest.spyOn(service, 'saveUserPreference').mockResolvedValue(true)
      service.initialize()
      configSvc.prefChangeNotifier.next({ isDarkMode: true })
      jest.advanceTimersByTime(250)
      expect(saveSpy).toHaveBeenCalledWith({ isDarkMode: true })
    })

    it('should not save when the user is not authenticated', () => {
      configSvc.isAuthenticated = false
      const saveSpy = jest.spyOn(service, 'saveUserPreference').mockResolvedValue(true)
      service.initialize()
      configSvc.prefChangeNotifier.next({ isDarkMode: true })
      jest.advanceTimersByTime(250)
      expect(saveSpy).not.toHaveBeenCalled()
    })

    it('should collapse rapid changes into a single save', () => {
      const saveSpy = jest.spyOn(service, 'saveUserPreference').mockResolvedValue(true)
      service.initialize()
      configSvc.prefChangeNotifier.next({ isDarkMode: true })
      configSvc.prefChangeNotifier.next({ isDarkMode: false })
      jest.advanceTimersByTime(250)
      expect(saveSpy).toHaveBeenCalledTimes(1)
      expect(saveSpy).toHaveBeenCalledWith({ isDarkMode: false })
    })
  })

  describe('fetchUserPreference', () => {
    it('should get the preference from the user-pref endpoint', async () => {
      await expect(service.fetchUserPreference()).resolves.toEqual({ selectedLocale: 'en' })
      expect(mockHttp.get).toHaveBeenCalledWith(API_END_POINTS.userPref)
    })
  })

  describe('saveUserPreference', () => {
    it('should return false and skip the call when nothing changed', async () => {
      await expect(service.saveUserPreference()).resolves.toBe(false)
      expect(mockHttp.put).not.toHaveBeenCalled()
    })

    it('should build the payload from defaults when nothing is stored', async () => {
      await expect(service.saveUserPreference({ isDarkMode: true })).resolves.toBe(true)

      const [url, body] = mockHttp.put.mock.calls[0]
      expect(url).toBe(API_END_POINTS.userPref)
      expect(body).toEqual(expect.objectContaining({
        pinnedApps: '',
        isDarkMode: true,
        isRTL: false,
        selectedTheme: 'theme-igot',
        selectedFont: '',
        selectedLangGroup: '',
        selectedLocale: '',
        colorPallet: [],
        defaultCardType: '',
        completedActivity: [],
        completedTour: false,
        profileSettings: ['profilePicture'],
      }))
    })

    it('should carry the stored preference values forward', async () => {
      configSvc.userPreference = {
        pinnedApps: 'a,b',
        selectedLangGroup: 'indic',
        selectedLocale: 'hi',
        colorPallet: ['#fff'],
        defaultCardType: 'wide',
        completedActivity: ['tour'],
        profileSettings: ['learningTime'],
      }
      configSvc.activeFontObject = { fontClass: 'font-lg' }
      configSvc.isRTL = true
      configSvc.completedTour = true

      await service.saveUserPreference({ isDarkMode: false })

      expect(mockHttp.put.mock.calls[0][1]).toEqual(expect.objectContaining({
        pinnedApps: 'a,b',
        selectedLangGroup: 'indic',
        selectedLocale: 'hi',
        colorPallet: ['#fff'],
        defaultCardType: 'wide',
        completedActivity: ['tour'],
        profileSettings: ['learningTime'],
        selectedFont: 'font-lg',
        isRTL: true,
        completedTour: true,
      }))
    })

    it('should let the incoming change override the stored pinnedApps', async () => {
      configSvc.userPreference = { pinnedApps: 'old' }
      await service.saveUserPreference({ pinnedApps: 'new' })
      expect(mockHttp.put.mock.calls[0][1].pinnedApps).toBe('new')
    })

    it('should optimistically apply the new preference to the config service', async () => {
      await service.saveUserPreference({ isDarkMode: true })
      expect(configSvc.userPreference.isDarkMode).toBe(true)
    })

    it('should roll the preference back when the save request fails', async () => {
      const previous = { selectedLocale: 'hi' }
      configSvc.userPreference = previous
      mockHttp.put.mockReturnValue(throwError(() => new Error('network')))

      await expect(service.saveUserPreference({ isDarkMode: true })).resolves.toBe(true)
      expect(configSvc.userPreference).toBe(previous)
    })

    it('should return false when building the payload throws', async () => {
      Object.defineProperty(configSvc, 'isDarkMode', {
        get() { throw new Error('boom') },
      })
      await expect(service.saveUserPreference({ isRTL: true })).resolves.toBe(false)
    })
  })
})
