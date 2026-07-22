import { of, throwError } from 'rxjs'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ConfigurationsService } from '@ws-widget/utils'
import { SettingsService } from '../../settings.service'
import { NotificationSettingsComponent } from './notification-settings.component'

describe('NotificationSettingsComponent', () => {
  let component: NotificationSettingsComponent
  let mockSnackBar: Partial<MatSnackBar>
  let mockSettingsSvc: Partial<SettingsService>
  let mockConfigSvc: Partial<ConfigurationsService>

  const sampleGroup = [
    {
      events: [
        {
          recipients: [
            { modes: [{ status: false }, { status: true }] },
          ],
        },
      ],
    },
  ]

  const createComponent = () => new NotificationSettingsComponent(
    mockSnackBar as MatSnackBar,
    mockSettingsSvc as SettingsService,
    mockConfigSvc as ConfigurationsService,
  )

  beforeEach(() => {
    mockSnackBar = { open: jest.fn() }
    mockSettingsSvc = {
      fetchNotificationSettings: jest.fn().mockReturnValue(of(sampleGroup)),
      updateNotificationSettings: jest.fn().mockReturnValue(of({})),
    }
    mockConfigSvc = { userRoles: new Set(['learner']) }
    component = createComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should set userRoles from configSvc and fetch notification settings on success', () => {
      component.ngOnInit()
      expect(component.userRoles).toEqual(new Set(['learner']))
      expect(component.notificationSettings).toEqual(sampleGroup)
      expect(component.notificationsFetchStatus).toBe('done')
    })

    it('should default userRoles to empty set when configSvc.userRoles is falsy', () => {
      mockConfigSvc.userRoles = undefined as any
      component = createComponent()
      component.ngOnInit()
      expect(component.userRoles).toEqual(new Set())
    })

    it('should set notificationsFetchStatus to error when fetch fails', () => {
      mockSettingsSvc.fetchNotificationSettings = jest.fn().mockReturnValue(throwError(() => new Error('fail')))
      component = createComponent()
      component.ngOnInit()
      expect(component.notificationsFetchStatus).toBe('error')
    })
  })

  describe('updateMode', () => {
    it('should toggle mode status for the given recipient and update settings on success', () => {
      component.notificationSettings = JSON.parse(JSON.stringify(sampleGroup))
      component.updateMode(0, 0, 'Success', 'Error')
      expect(component.notificationSettings[0].events[0].recipients[0].modes[0].status).toBe(true)
      expect(component.notificationSettings[0].events[0].recipients[0].modes[1].status).toBe(false)
      expect(component.notificationsUpdateStatus).toBe('done')
      expect(mockSnackBar.open).toHaveBeenCalledWith('Success')
    })

    it('should show error message when update fails', () => {
      mockSettingsSvc.updateNotificationSettings = jest.fn().mockReturnValue(throwError(() => new Error('fail')))
      component = createComponent()
      component.notificationSettings = JSON.parse(JSON.stringify(sampleGroup))
      component.updateMode(0, 0, 'Success', 'Error')
      expect(component.notificationsUpdateStatus).toBe('error')
      expect(mockSnackBar.open).toHaveBeenCalledWith('Error')
    })
  })

  describe('getSupportedModes', () => {
    it('should return the modes from the first recipient', () => {
      const event = { recipients: [{ modes: [{ status: true }] }] } as any
      expect(component.getSupportedModes(event)).toEqual([{ status: true }])
    })
  })
})
