import { NotificationsComponent } from './notification.component'
import { of } from 'rxjs'
import { Socket } from 'socket.io-client'

describe('NotificationsComponent', () => {
  let component: NotificationsComponent
  let mockEvents: any
  let mockStorage: any
  let mockRouter: any
  let mockRenderer: any
  let mockConfigSvc: any
  let mockValueSvc: any
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
      mockValueSvc
    )
    component.socket = mockSocket as unknown as Socket
  })

  it('should initialize component and fetch notifications', async () => {
    const getAccessTokenSpy = jest.spyOn(component, 'getAccessToken').mockResolvedValue('token123')
    const getNotificationSpy = jest.spyOn(component, 'getNotification').mockResolvedValue(undefined)
    const connectSocketSpy = jest.spyOn(component, 'connectSocket').mockResolvedValue(undefined)

    await component.ngOnInit()

    expect(getAccessTokenSpy).toHaveBeenCalled()
    expect(getNotificationSpy).toHaveBeenCalled()
    expect(connectSocketSpy).toHaveBeenCalled()
  })

  it('should handle action to mark all as read', () => {
    component.unReadNotificationList = [{ id: '1', status: 'unread' }]
    component.user_id = 'user123'

    component.handleAction('read')

    expect(mockSocket.emit).toHaveBeenCalledWith('markAllAsRead', { userId: 'user123' })
    expect(component.unReadNotificationList[0].status).toBe('read')
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

  it('should handle API failure in getNotification', async () => {
    const mockData = { notificationData: [{ id: '1', data: '{"message": "test"}' }] }
    mockSocket.on.mockImplementation((event, callback) => {
      if (event === 'notificationsData') {
        callback(mockData)
      }
    })
    const loaderDismissSpy = jest.fn()
    component.loader = { dismiss: loaderDismissSpy }

    await component.getNotification()

    expect(mockStorage.setNumberOfNotifications).toHaveBeenCalledWith(mockData.notificationData.length)
    expect(mockEvents.publish).toHaveBeenCalledWith('notificationCountUpdated', mockData.notificationData.length)
    expect(loaderDismissSpy).toHaveBeenCalled()
  })

  it('should handle read notification', async () => {
    const item = { id: '1', status: 'unread', data: { actionData: { actionType: 'course', identifier: 'course123' } } }
    component.user_id = 'user123'
    component.unReadNotificationList = [item]

    await component.readNotification(item)

    expect(mockSocket.emit).toHaveBeenCalledWith('markAsRead', { notificationId: '1', userId: 'user123' })
    expect(mockStorage.setNumberOfNotifications).toHaveBeenCalledWith(0)
    expect(mockEvents.publish).toHaveBeenCalledWith('notificationCountUpdated', 0)
    expect(component.readNotificationList).toContainEqual({ ...item, status: 'read' })
    expect(component.unReadNotificationList).not.toContain(item)
  })

  it('should handle delete notification', async () => {
    const item = { id: '1', status: 'unread' }
    component.user_id = 'user123'
    component.unReadNotificationList = [item]

    await component.deleteNotification(item)

    expect(mockSocket.emit).toHaveBeenCalledWith('markAsRead', { notificationId: '1', userId: 'user123' })
    expect(mockEvents.publish).toHaveBeenCalledWith('notificationCountUpdated', 0)
    expect(component.unReadNotificationList).not.toContain(item)
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

  it('should close dialog', () => {
    component.dropdownContent = true
    component.closeDailog()
    expect(component.dropdownContent).toBe(false)
  })

  it('should disconnect socket on destroy', () => {
    component.ngOnDestroy()
    expect(mockSocket.disconnect).toHaveBeenCalled()
  })
})