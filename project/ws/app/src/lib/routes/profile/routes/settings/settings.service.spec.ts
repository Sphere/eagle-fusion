import { SettingsService } from './settings.service'
import { API_END_POINTS } from '../../../../../../../../../src/app/constants/apiConstants'

describe('SettingsService', () => {
  let service: SettingsService
  let http: { get: jest.Mock, patch: jest.Mock }

  beforeEach(() => {
    http = { get: jest.fn(), patch: jest.fn() }
    service = new SettingsService(http as any)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('should fetch notification settings', () => {
    const response = [{ id: 1 }]
    http.get.mockReturnValue(response)
    const result = service.fetchNotificationSettings()
    expect(http.get).toHaveBeenCalledWith(API_END_POINTS.NOTIFICATIONS)
    expect(result).toBe(response)
  })

  it('should update notification settings', () => {
    const body = [{ id: 1 }] as any
    const response = { success: true }
    http.patch.mockReturnValue(response)
    const result = service.updateNotificationSettings(body)
    expect(http.patch).toHaveBeenCalledWith(API_END_POINTS.NOTIFICATIONS, body)
    expect(result).toBe(response)
  })
})
