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
  const mockConfigSvc = {} as any
  const mockLanguageSvc = { getCurrentLanguage: jest.fn().mockReturnValue('en') } as any
  const mockPlaylistSvc = {
    getPlaylistConfig: jest.fn().mockResolvedValue({ result: { playlist: [] } }),
    setEarnedBadges: jest.fn(),
  } as any
  const mockDialogRef = { close: jest.fn() } as any as MatDialogRef<CongratulationsPopupComponent>
  const mockTelemetrySvc = { interact: jest.fn() } as any
  const mockLogger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any

  beforeEach(() => {
    jest.clearAllMocks()
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
})
