jest.mock('../../../../../../../../../src/app/services/playlist.service', () => ({
  PlaylistService: class {
    orgDetails = jest.fn().mockReturnValue({})
    footerConfig = jest.fn().mockReturnValue({})
    getPlaylistConfig = jest.fn().mockResolvedValue({ result: { playlist: [] } })
    setEarnedBadges = jest.fn()
  },
}))
jest.mock('../../../../../../../../../library/ws-widget/utils/src/public-api', () => ({
  ConfigurationsService: class {},
  LoggerService: class { log = jest.fn(); warn = jest.fn(); error = jest.fn() },
  TelemetryService: class { interact = jest.fn() },
}))
jest.mock('../../../../../../../../../src/app/services/language.service', () => ({
  LanguageService: class { getCurrentLanguage = jest.fn().mockReturnValue('en') },
}))

import { CongratulationsPopupComponent } from './congratulations-popup.component'
import { MatDialogRef } from '@angular/material/dialog'

describe('CongratulationsPopupComponent', () => {
  let component: CongratulationsPopupComponent

  const mockData = { collectionId: 'test-collection-id' }
  let mockConfigSvc: any
  const mockLanguageSvc = { getCurrentLanguage: jest.fn().mockReturnValue('en') } as any
  let mockPlaylistSvc: any
  const mockDialogRef = { close: jest.fn() } as any as MatDialogRef<CongratulationsPopupComponent>
  const mockTelemetrySvc = { interact: jest.fn() } as any
  const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any

  beforeEach(() => {
    jest.clearAllMocks()
    mockConfigSvc = {
      unMappedUser: {
        profileDetails: {
          profileReq: {
            professionalDetails: [{ designation: 'MP-Nurse' }],
          },
        },
      },
    }
    mockPlaylistSvc = {
      getPlaylistConfig: jest.fn().mockResolvedValue({ result: { playlist: [] } }),
      setEarnedBadges: jest.fn(),
    }
    component = new CongratulationsPopupComponent(
      mockData,
      mockConfigSvc,
      mockLanguageSvc,
      mockPlaylistSvc,
      mockDialogRef,
      mockTelemetrySvc,
      mockLogger
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('generateInteractTelemetry', () => {
    it('raises interact telemetry with the collectionId', () => {
      component.generateInteractTelemetry()
      expect(mockTelemetrySvc.interact).toHaveBeenCalledWith(
        'open-congratulation-popup',
        'popup-open',
        'course-completion-popup',
        expect.objectContaining({ id: 'test-collection-id' }),
        expect.objectContaining({ values: [expect.objectContaining({ identifier: 'test-collection-id', completionPercentage: 100 })] }),
      )
    })

    it('defaults id to empty string when collectionId is missing', () => {
      component.data = {}
      component.generateInteractTelemetry()
      expect(mockTelemetrySvc.interact).toHaveBeenCalledWith(
        'open-congratulation-popup',
        'popup-open',
        'course-completion-popup',
        expect.objectContaining({ id: '' }),
        expect.anything(),
      )
    })
  })

  describe('close', () => {
    it('closes the dialog with completed true', () => {
      component.close()
      expect(mockDialogRef.close).toHaveBeenCalledWith({ completed: true })
    })
  })

  describe('fetchPlayLists', () => {
    it('resolves with the matching playlist payload', async () => {
      mockPlaylistSvc.getPlaylistConfig.mockResolvedValue({
        result: {
          playlist: [
            { language: 'en', role: ['ASHA'], dataSource: { payload: ['course-1'] } },
          ],
        },
      })
      const result = await component.fetchPlayLists('en', 'ASHA')
      expect(result).toEqual(['course-1'])
    })

    it('resolves with an empty array when nothing matches', async () => {
      mockPlaylistSvc.getPlaylistConfig.mockResolvedValue({ result: { playlist: [] } })
      const result = await component.fetchPlayLists('en', 'ASHA')
      expect(result).toEqual([])
    })

    it('rejects when getPlaylistConfig fails', async () => {
      mockPlaylistSvc.getPlaylistConfig.mockRejectedValue(new Error('network error'))
      await expect(component.fetchPlayLists('en', 'ASHA')).rejects.toThrow('network error')
    })
  })

  describe('ngOnInit', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('sets designation from the profile and awards a badge for a matching ASHA playlist', async () => {
      mockPlaylistSvc.getPlaylistConfig.mockResolvedValue({
        result: {
          playlist: [
            { language: 'en', role: ['MP-Nurse'], dataSource: { payload: ['test-collection-id'] } },
          ],
        },
      })
      await component.ngOnInit()
      await Promise.resolve()
      expect(component.designation).toBe('MP-Nurse')
      expect(component.earnedBadge).toBe(true)
      expect(mockPlaylistSvc.setEarnedBadges).toHaveBeenCalledWith(1, true)
    })

    it('sets earnedBadge false when the collection is not in the playlist', async () => {
      mockPlaylistSvc.getPlaylistConfig.mockResolvedValue({
        result: {
          playlist: [
            { language: 'en', role: ['MP-Nurse'], dataSource: { payload: ['some-other-id'] } },
          ],
        },
      })
      await component.ngOnInit()
      await Promise.resolve()
      expect(component.earnedBadge).toBe(false)
      expect(mockPlaylistSvc.setEarnedBadges).not.toHaveBeenCalled()
    })

    it('sets earnedBadge false when fetchPlayLists rejects', async () => {
      mockPlaylistSvc.getPlaylistConfig.mockRejectedValue(new Error('boom'))
      await component.ngOnInit()
      await Promise.resolve()
      expect(component.earnedBadge).toBe(false)
    })

    it('defaults designation to empty string when professionalDetails is missing', async () => {
      mockConfigSvc.unMappedUser = {}
      mockPlaylistSvc.getPlaylistConfig.mockResolvedValue({ result: { playlist: [] } })
      await component.ngOnInit()
      await Promise.resolve()
      expect(component.designation).toBe('')
      expect(component.earnedBadge).toBe(false)
    })

    it('auto-closes the dialog after 3 seconds', async () => {
      mockPlaylistSvc.getPlaylistConfig.mockResolvedValue({ result: { playlist: [] } })
      await component.ngOnInit()
      jest.advanceTimersByTime(3000)
      expect(mockDialogRef.close).toHaveBeenCalledWith({ completed: true })
    })
  })
})
