import { NotificationComponent } from './notification.component'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'

describe('NotificationComponent', () => {
  const createComponent = (data: any) => new NotificationComponent(data)

  it('should create', () => {
    const component = createComponent({ type: Notify.SUCCESS, data: {} })
    expect(component).toBeTruthy()
  })

  it('should set type and otherData from injected data', () => {
    const otherData = { foo: 'bar' }
    const component = createComponent({ type: Notify.SAVE_SUCCESS, data: otherData })
    expect(component.type).toBe(Notify.SAVE_SUCCESS)
    expect(component.otherData).toBe(otherData)
  })

  describe('canShow', () => {
    const successTypes = [
      Notify.SAVE_SUCCESS,
      Notify.UPLOAD_SUCCESS,
      Notify.REVIEW_SUCCESS,
      Notify.PUBLISH_SUCCESS,
      Notify.EMAIL_SUCCESS,
      Notify.SUCCESS,
      Notify.SEND_FOR_REVIEW_SUCCESS,
    ]

    const failTypes = [
      Notify.SAVE_FAIL,
      Notify.UPLOAD_FAIL,
      Notify.SEND_FOR_REVIEW_FAIL,
      Notify.REVIEW_FAIL,
      Notify.PUBLISH_FAIL,
      Notify.EMAIL_FAIL,
      Notify.FAIL,
      Notify.CONTENT_FAIL,
    ]

    successTypes.forEach(type => {
      it(`should return true for success msg with type ${type}`, () => {
        const component = createComponent({ type, data: {} })
        expect(component.canShow('success')).toBe(true)
      })

      it(`should return false for non-success msg with type ${type}`, () => {
        const component = createComponent({ type, data: {} })
        expect(component.canShow('other')).toBe(false)
      })
    })

    failTypes.forEach(type => {
      it(`should return true for failure msg with type ${type}`, () => {
        const component = createComponent({ type, data: {} })
        expect(component.canShow('failure')).toBe(true)
      })

      it(`should return false for non-failure msg with type ${type}`, () => {
        const component = createComponent({ type, data: {} })
        expect(component.canShow('other')).toBe(false)
      })
    })

    it('should return false for unhandled type', () => {
      const component = createComponent({ type: Notify.COPY, data: {} })
      expect(component.canShow('success')).toBe(false)
    })
  })
})
