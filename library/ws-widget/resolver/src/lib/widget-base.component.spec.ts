import { WidgetBaseComponent } from './widget-base.component'

describe('WidgetBaseComponent', () => {
  let component: WidgetBaseComponent

  beforeEach(() => {
    jest.useFakeTimers()
    component = new WidgetBaseComponent()
    window.location.hash = ''
  })

  afterEach(() => {
    jest.useRealTimers()
    window.location.hash = ''
    document.body.innerHTML = ''
  })

  it('should create with empty defaults', () => {
    expect(component).toBeTruthy()
    expect(component.widgetType).toBe('')
    expect(component.widgetSubType).toBe('')
    expect(component.widgetHostClass).toBeUndefined()
    expect(component.widgetInstanceId).toBeUndefined()
    expect(component.widgetSafeStyle).toBeUndefined()
    expect(component.className).toBeUndefined()
  })

  describe('updateBaseComponent', () => {
    it('should copy every supplied value onto the component', () => {
      component.updateBaseComponent('card', 'cardContent', 'w1', 'my-class', 'color:red;' as any)
      expect(component.widgetType).toBe('card')
      expect(component.widgetSubType).toBe('cardContent')
      expect(component.widgetInstanceId).toBe('w1')
      expect(component.widgetHostClass).toBe('my-class')
      expect(component.widgetSafeStyle).toBe('color:red;')
    })

    it('should append the host class to the existing class name', () => {
      component.className = 'base'
      component.updateBaseComponent('card', 'cardContent', undefined, 'extra')
      expect(component.className).toBe('base extra')
    })

    it('should leave the class name alone when there is no host class', () => {
      component.className = 'base'
      component.updateBaseComponent('card', 'cardContent')
      expect(component.className).toBe('base')
    })
  })

  describe('ngAfterViewInit', () => {
    it('should scroll the matching element into view for a numeric hash', () => {
      const element = document.createElement('div')
      element.id = '42'
      element.scrollIntoView = jest.fn()
      document.body.appendChild(element)

      component.widgetInstanceId = '42'
      window.location.hash = '#42'
      component.ngAfterViewInit()
      jest.advanceTimersByTime(200)

      expect(element.scrollIntoView).toHaveBeenCalled()
    })

    it('should do nothing when the hash does not match the instance id', () => {
      const element = document.createElement('div')
      element.id = '42'
      element.scrollIntoView = jest.fn()
      document.body.appendChild(element)

      component.widgetInstanceId = '42'
      window.location.hash = '#7'
      component.ngAfterViewInit()
      jest.advanceTimersByTime(200)

      expect(element.scrollIntoView).not.toHaveBeenCalled()
    })

    it('should ignore a non-numeric hash', () => {
      component.widgetInstanceId = 'abc'
      window.location.hash = '#abc'
      expect(() => {
        component.ngAfterViewInit()
        jest.advanceTimersByTime(200)
      }).not.toThrow()
    })

    it('should do nothing when there is no hash', () => {
      component.widgetInstanceId = '42'
      expect(() => {
        component.ngAfterViewInit()
        jest.advanceTimersByTime(200)
      }).not.toThrow()
    })

    it('should tolerate a matching hash with no element in the dom', () => {
      component.widgetInstanceId = '99'
      window.location.hash = '#99'
      expect(() => {
        component.ngAfterViewInit()
        jest.advanceTimersByTime(200)
      }).not.toThrow()
    })
  })
})
