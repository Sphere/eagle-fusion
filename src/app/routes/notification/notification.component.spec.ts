import { NotificationsComponent } from './notification.component'
import { of } from 'rxjs'
import { ChangeDetectorRef } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog'
import { Socket } from 'socket.io-client'

describe('NotificationsComponent', () => {
  let component: NotificationsComponent
  let mockEvents: any
  let mockStorage: any
  let mockRouter: any
  let mockRenderer: any
  let mockConfigSvc: any
  let mockValueSvc: any
  let mockDialogRef: any
  let mockCdr: any
  let mockSocket: any

  beforeEach(() => {
    mockEvents = {
      publish: jest.fn(),
    }
    mockStorage = {
      setLocalStorage: jest.fn(),
      getLocalStorage: jest.fn().mockResolvedValue({ userId: 'user123', notifications: [] }),
      setNumberOfNotifications: jest.fn(),
    }
    mockRouter = {
      navigate: jest.fn(),
    }
    mockRenderer = {
      listen: jest.fn(),
    }
    mockConfigSvc = {
      userProfile: { userId: 'user123' },
    }
    mockValueSvc = {
      isXSmall$: of(false),
    }
    mockDialogRef = {
      close: jest.fn(),
    }
    mockCdr = {
      detectChanges: jest.fn(),
    }
    mockSocket = {
      emit: jest.fn(),
      on: jest.fn(),
      connected: true,
      disconnect: jest.fn(),
    }
    mockDialogRef = {
      close: jest.fn(),
    }
    mockCdr = {
      detectChanges: jest.fn(),
    }

    component = new NotificationsComponent(
      mockEvents,
      mockStorage,
      mockRouter,
      mockRenderer,
      mockConfigSvc,
      mockValueSvc,
      mockDialogRef as MatDialogRef<any>,
      mockCdr as ChangeDetectorRef,
      { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any
    )
    component.socket = mockSocket as unknown as Socket
    component.user_id = 'user123' // Initialize user_id here

  })


  it('should handle action to mark all as read', () => {
    component.unReadNotificationList = [{ id: '1', status: 'unread' }]
    component.user_id = 'user123'

    component.handleAction('read')

    expect(mockSocket.emit).toHaveBeenCalledWith('markAllAsRead', { userId: 'user123' })
    expect(component.unReadNotificationList.length).toBe(0)
    expect(component.readNotificationList.length).toBe(1)
    expect(mockStorage.setLocalStorage).toHaveBeenCalledWith('readNotificationLists', {
      userId: 'user123',
      notifications: component.readNotificationList,
    })
    expect(mockStorage.setNumberOfNotifications).toHaveBeenCalledWith(0)
    expect(mockEvents.publish).toHaveBeenCalledWith('notificationCountUpdated', 0)
  })

  it('should handle action to clear all notifications', () => {
    component.readNotificationList = [{ id: '1', status: 'read' }]
    component.unReadNotificationList = [{ id: '2', status: 'unread' }]
    component.user_id = 'user123'

    component.handleAction('clear')

    expect(component.allnotificationList.length).toBe(0)
    expect(component.readNotificationList.length).toBe(0)
    expect(component.unReadNotificationList.length).toBe(0)
    expect(mockStorage.setLocalStorage).toHaveBeenCalledWith('readNotificationLists', {
      userId: 'user123',
      notifications: [],
    })
    expect(mockStorage.setNumberOfNotifications).toHaveBeenCalledWith(0)
    expect(mockEvents.publish).toHaveBeenCalledWith('notificationCountUpdated', 0)
  })

  it('should fetch notifications and update unread list', async () => {
    const mockData = {
      notificationData: [
        { id: '1', data: '{"message": "test"}' },
        { id: '2', data: '{"message": "test2"}' },
      ],
    }
    mockSocket.on.mockImplementation((event: string, callback: (data: any) => void) => {
      if (event === 'notificationsData') {
        callback(mockData)
      }
    })

    await component.getNotification()

    expect(mockSocket.emit).toHaveBeenCalledWith('getNotifications', { userId: 'user123' })
    expect(component.unReadNotificationList.length).toBe(2)
    expect(mockStorage.setNumberOfNotifications).toHaveBeenCalledWith(2)
    expect(mockEvents.publish).toHaveBeenCalledWith('notificationCountUpdated', 2)
  })

  it('should handle read notification', async () => {
    const item = { id: '1', status: 'unread', data: { actionData: { actionType: 'course' } } }
    component.unReadNotificationList = [item]
    component.user_id = 'user123'

    await component.readNotification(item)

    expect(mockSocket.emit).toHaveBeenCalledWith('markAsRead', { notificationId: '1', userId: 'user123' })
    expect(component.unReadNotificationList.length).toBe(0)
    expect(component.readNotificationList.length).toBe(1)
    expect(mockStorage.setLocalStorage).toHaveBeenCalledWith('readNotificationLists', {
      userId: 'user123',
      notifications: component.readNotificationList,
    })
    expect(mockStorage.setNumberOfNotifications).toHaveBeenCalledWith(0)
    expect(mockEvents.publish).toHaveBeenCalledWith('notificationCountUpdated', 0)
    expect(mockDialogRef.close).toHaveBeenCalled()
    expect(mockCdr.detectChanges).toHaveBeenCalled()
  })

  it('should handle delete notification', async () => {
    const item = { id: '1', status: 'unread' }
    component.unReadNotificationList = [item]
    component.user_id = 'user123'

    await component.deleteNotification(item)

    expect(mockSocket.emit).toHaveBeenCalledWith('markAsRead', { notificationId: '1', userId: 'user123' })
    expect(component.unReadNotificationList.length).toBe(0)
    expect(mockStorage.setNumberOfNotifications).toHaveBeenCalledWith(0) // Verify the call
    expect(mockEvents.publish).toHaveBeenCalledWith('notificationCountUpdated', 0)
  })

  it('should calculate notification time in minutes', () => {
    const createdOn = new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
    const time = component.getNotificationTime(createdOn)
    expect(time).toBe('5mins')
  })

  it('should calculate notification time in hours', () => {
    const createdOn = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    const time = component.getNotificationTime(createdOn)
    expect(time).toBe('2hr')
  })

  it('should calculate notification time in days', () => {
    const createdOn = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
    const time = component.getNotificationTime(createdOn)
    expect(time).toBe('3d')
  })

  it('should disconnect socket on destroy', () => {
    component.ngOnDestroy()
    expect(mockSocket.disconnect).toHaveBeenCalled()
  })

  it('should handle touch events', () => {
    const element = { style: { transform: '' } } as HTMLElement
    const touchStartEvent = { touches: [{ clientX: 100 }] } as unknown as TouchEvent
    const touchMoveEvent = { touches: [{ clientX: 50 }] } as unknown as TouchEvent
    const touchEndEvent = {} as TouchEvent

    component.onTouchStart(touchStartEvent, element)
    expect(component.startX).toBe(100)

    component.onTouchMove(touchMoveEvent, element)
    expect(element.style.transform).toBe('translateX(-50px)')

    component.onTouchEnd(touchEndEvent, element, 0)
    expect(element.style.transform).toBe('translateX(0)')
  })

  it('ngOnInit should set user_id from configSvc.userProfile', () => {
    component.ngOnInit()
    expect(component.user_id).toBe('user123')
  })

  it('ngOnInit should set user_id to empty when userProfile is null', () => {
    mockConfigSvc.userProfile = null
    component.ngOnInit()
    expect(component.user_id).toBe('')
  })

  it('openDailog should toggle dropdownContent', () => {
    expect(component.dropdownContent).toBe(false)
    component.openDailog()
    expect(component.dropdownContent).toBe(true)
    component.openDailog()
    expect(component.dropdownContent).toBe(false)
  })

  it('closeDailog should set dropdownContent to false when it is true', () => {
    component.dropdownContent = true
    component.closeDailog()
    expect(component.dropdownContent).toBe(false)
  })

  it('closeDailog should not change dropdownContent when it is already false', () => {
    component.dropdownContent = false
    component.closeDailog()
    expect(component.dropdownContent).toBe(false)
  })

  it('getAccessToken should return token from localStorage', async () => {
    const tokenData = JSON.stringify({ token: { access_token: 'my-token-123' } })
    localStorage.setItem('loginDetailsWithToken', tokenData)
    const result = await component.getAccessToken()
    expect(result).toBe('my-token-123')
    localStorage.removeItem('loginDetailsWithToken')
  })

  it('getAccessToken should return empty string when no localStorage data', async () => {
    localStorage.removeItem('loginDetailsWithToken')
    const result = await component.getAccessToken()
    expect(result).toBe('')
  })

  it('getReadNotifications should set readNotificationList when userId matches', async () => {
    mockStorage.getLocalStorage = jest.fn().mockResolvedValue({
      userId: 'user123',
      notifications: [{ id: '1', status: 'read' }],
    })
    component.user_id = 'user123'
    component.getReadNotifications()
    await Promise.resolve()
    expect(component.readNotificationList).toEqual([{ id: '1', status: 'read' }])
  })

  it('getReadNotifications should not update when userId does not match', async () => {
    mockStorage.getLocalStorage = jest.fn().mockResolvedValue({
      userId: 'other-user',
      notifications: [{ id: '1', status: 'read' }],
    })
    component.user_id = 'user123'
    component.getReadNotifications()
    await Promise.resolve()
    expect(component.readNotificationList).toEqual([])
  })

  it('setAllNotificationList should merge and sort notifications', () => {
    component.readNotificationList = [{ createdon: '2025-01-01T00:00:00Z', status: 'read' }]
    component.unReadNotificationList = [{ createdon: '2025-01-02T00:00:00Z', status: 'unread' }]
    component.setAllNotificationList()
    expect(component.allnotificationList.length).toBe(2)
    expect(component.allnotificationList[0].status).toBe('unread')
  })

  it('setAllNotificationList should not change allnotificationList when both lists are empty', () => {
    component.readNotificationList = []
    component.unReadNotificationList = []
    component.allnotificationList = []
    component.setAllNotificationList()
    expect(component.allnotificationList).toEqual([])
  })

  it('deleteNotification should remove item from readNotificationList when status is read', async () => {
    const item = { id: '1', status: 'read' }
    component.readNotificationList = [item]
    component.user_id = 'user123'
    await component.deleteNotification(item)
    expect(component.readNotificationList.length).toBe(0)
    expect(mockStorage.setLocalStorage).toHaveBeenCalled()
  })

  describe('notificationAction', () => {
    it('should navigate to course overview on actionType course', async () => {
      const item = { data: { actionData: { actionType: 'course', identifier: 'do_123' } } }
      await component.notificationAction(item)
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc/do_123/overview'], { replaceUrl: true })
    })

    it('should navigate to course overview on actionType certificate', async () => {
      const item = { data: { actionData: { actionType: 'certificate', identifier: 'do_456' } } }
      await component.notificationAction(item)
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc/do_456/overview'], { replaceUrl: true })
    })

    it('should close dialog even when item has no actionData', async () => {
      const item = { data: {} }
      await component.notificationAction(item)
      expect(mockDialogRef.close).toHaveBeenCalled()
    })
  })

  it('handleKeyDown should call readNotification on Enter key', () => {
    const item = { id: '1', status: 'unread', data: { actionData: { actionType: 'course' } } }
    component.unReadNotificationList = [item]
    const spy = jest.spyOn(component, 'readNotification').mockImplementation(() => Promise.resolve())
    const event = { key: 'Enter', preventDefault: jest.fn() } as any
    component.handleKeyDown(event, item)
    expect(spy).toHaveBeenCalledWith(item)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('handleKeyDown should not call readNotification for other keys', () => {
    const item = { id: '1', status: 'unread' }
    const spy = jest.spyOn(component, 'readNotification').mockImplementation(() => Promise.resolve())
    const event = { key: 'Tab', preventDefault: jest.fn() } as any
    component.handleKeyDown(event, item)
    expect(spy).not.toHaveBeenCalled()
  })

  it('ngAfterViewInit should call renderer.listen', () => {
    component.ngAfterViewInit()
    expect(mockRenderer.listen).toHaveBeenCalledWith('document', 'click', expect.any(Function))
  })

  it('onTouchEnd should set transform to threshold when movedX is less than threshold', () => {
    const element = { style: { transform: '' } } as HTMLElement
    component.movedX = -100
    component.onTouchEnd({} as TouchEvent, element, 0)
    expect(element.style.transform).toBe('translateX(-80px)')
  })
})