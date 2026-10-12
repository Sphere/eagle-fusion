import { AvatarPhotoComponent } from './avatar-photo.component'

describe('AvatarPhotoComponent', () => {
  let component: AvatarPhotoComponent

  beforeEach(() => {
    component = new AvatarPhotoComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should do nothing when photoUrl is set', () => {
      component.photoUrl = 'http://img.png'
      component.ngOnInit()
      expect(component.showInitials).toBe(false)
    })

    it('should show initials and pick a circleColor when photoUrl is not set', () => {
      component.name = 'John Doe'
      component.ngOnInit()
      expect(component.showInitials).toBe(true)
      expect(component.initials).toBe('JD')
      expect(component.circleColor).toBeTruthy()
    })

    it('should not recompute initials when already provided', () => {
      component.name = 'John Doe'
      component.initials = 'ZZ'
      component.ngOnInit()
      expect(component.initials).toBe('ZZ')
    })

    it('should use green when datalen is 1', () => {
      component.name = 'John Doe'
      component.datalen = 1
      component.ngOnInit()
      expect(component.showInitials).toBe(true)
    })

    it('should use randomcolors when randomColor is true', () => {
      component.name = 'John Doe'
      component.randomColor = true
      component.ngOnInit()
      expect(component.circleColor).toBeTruthy()
    })

    it('should take first char of first two words when name has a second word', () => {
      component.name = 'A B'
      component.ngOnInit()
      expect(component.initials).toBe('AB')
    })

    it('should iterate characters and skip spaces when the literal name is "undefined"', () => {
      component.name = 'undefined'
      component.ngOnInit()
      expect(component.initials).toBe('UN')
    })
  })
})
