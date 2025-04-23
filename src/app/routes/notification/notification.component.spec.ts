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

    component = new NotificationsComponent(
      mockEvents,
      mockStorage,
      mockRouter,
      mockRenderer,
      mockConfigSvc,
      mockValueSvc,
      mockDialogRef as MatDialogRef<any>,
      mockCdr as ChangeDetectorRef
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
})