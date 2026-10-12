import { UserImageComponent } from './user-image.component'

describe('UserImageComponent', () => {
  let component: UserImageComponent
  let configSvc: any

  beforeEach(() => {
    configSvc = { instanceConfig: null }
    component = new UserImageComponent(configSvc)
  })

  it('should create with the documented defaults', () => {
    expect(component).toBeTruthy()
    expect(component.email).toBe('')
    expect(component.userId).toBeNull()
    expect(component.userName).toBe('')
    expect(component.imageType).toBe('initial')
    expect(component.errorOccurred).toBe(false)
    expect(component.verifiedMicrosoftEmail).toBe('')
    expect(component.shortName).toBe('')
    expect(component.imageUrl).toBeNull()
  })

  describe('microsoft email verification', () => {
    beforeEach(() => {
      configSvc.instanceConfig = { microsoft: { validEmailExtensions: ['@corp.com'] } }
    })

    it('should accept an email with a configured extension', () => {
      component.email = 'ada@corp.com'
      component.ngOnChanges()
      expect(component.verifiedMicrosoftEmail).toBe('ada@corp.com')
    })

    it('should reject an email with an unlisted extension', () => {
      component.email = 'ada@other.com'
      component.ngOnChanges()
      expect(component.verifiedMicrosoftEmail).toBe('')
    })

    it('should skip verification when there is no email', () => {
      component.ngOnChanges()
      expect(component.verifiedMicrosoftEmail).toBe('')
    })

    it('should skip verification when no extensions are configured', () => {
      configSvc.instanceConfig = { microsoft: {} }
      component.email = 'ada@corp.com'
      component.ngOnChanges()
      expect(component.verifiedMicrosoftEmail).toBe('')
    })

    it('should skip verification when there is no microsoft config', () => {
      configSvc.instanceConfig = {}
      component.email = 'ada@corp.com'
      component.ngOnChanges()
      expect(component.verifiedMicrosoftEmail).toBe('')
    })

    it('should skip verification when there is no instance config', () => {
      configSvc.instanceConfig = null
      component.email = 'ada@corp.com'
      component.ngOnChanges()
      expect(component.verifiedMicrosoftEmail).toBe('')
    })
  })

  describe('short name', () => {
    it('should build initials from the first two name parts', () => {
      component.userName = 'ada lovelace king'
      component.ngOnChanges()
      expect(component.shortName).toBe('AL')
    })

    it('should build a single initial from a one-word name', () => {
      component.userName = 'ada'
      component.ngOnChanges()
      expect(component.shortName).toBe('A')
    })

    it('should fall back to the initial image type when there is no name', () => {
      component.imageType = 'rounded'
      component.userName = ''
      component.ngOnChanges()
      expect(component.imageType).toBe('initial')
      expect(component.shortName).toBe('')
    })

    it('should treat a blank double-space name as absent', () => {
      component.imageType = 'rounded'
      component.userName = '  '
      component.ngOnChanges()
      expect(component.imageType).toBe('initial')
    })

    it('should keep a non-default image type when a name is present', () => {
      component.imageType = 'name-initial'
      component.userName = 'Ada Lovelace'
      component.ngOnChanges()
      expect(component.imageType).toBe('name-initial')
    })
  })
})
