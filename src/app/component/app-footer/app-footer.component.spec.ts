import { AppFooterComponent } from './app-footer.component'
import { of } from 'rxjs'

describe('AppFooterComponent', () => {
  let component: AppFooterComponent
  let mockConfigSvc: any
  let mockValueSvc: any
  let mockDomSanitizer: any
  let mockRouter: any

  beforeEach(() => {
    mockConfigSvc = {
      restrictedFeatures: new Set(),
      instanceConfig: {
        logos: {
          app: 'app-logo-url',
        },
      },
      userProfile: { userId: 'user123' },
      unMappedUser: {
        profileDetails: {
          preferences: {
            language: 'en',
          },
        },
      },
    }
    mockValueSvc = {
      isXSmall$: of(false),
      isLtMedium$: of(false),
    }
    mockDomSanitizer = {
      bypassSecurityTrustResourceUrl: jest.fn().mockReturnValue('safe-url'),
    }
    mockRouter = {
      url: '/page/home',
      navigateByUrl: jest.fn(),
    }

    component = new AppFooterComponent(
      mockConfigSvc,
      mockValueSvc,
      mockDomSanitizer,
      mockRouter
    )
  })

  it('should initialize component with default values', () => {
    expect(component.isXSmall).toBe(false)
    expect(component.termsOfUser).toBe(true)
    expect(component.appIcon).toBe('safe-url')
    expect(component.isMedium).toBe(false)
    expect(component.currentYear).toBe(new Date().getFullYear())
    expect(component.isLoggedIn).toBe(true)
  })

  it('should set termsOfUser to false if restricted', () => {
    mockConfigSvc.restrictedFeatures.add('termsOfUser')
    component = new AppFooterComponent(
      mockConfigSvc,
      mockValueSvc,
      mockDomSanitizer,
      mockRouter
    )
    expect(component.termsOfUser).toBe(false)
  })

  it('should update isXSmall and isMedium based on valueSvc observables', () => {
    mockValueSvc.isXSmall$ = of(true)
    mockValueSvc.isLtMedium$ = of(true)
    component = new AppFooterComponent(
      mockConfigSvc,
      mockValueSvc,
      mockDomSanitizer,
      mockRouter
    )
    component.ngOnInit()
    expect(component.isXSmall).toBe(true)
    expect(component.isMedium).toBe(true)
  })

  it('should set appIcon based on instanceConfig', () => {
    expect(mockDomSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('app-logo-url')
    expect(component.appIcon).toBe('safe-url')
  })

  it('should set isLoggedIn based on userProfile', () => {
    expect(component.isLoggedIn).toBe(true)
  })

  it('should set appIcon based on isEkshamata input in ngOnInit', () => {
    component.isEkshamata = true
    component.ngOnInit()
    expect(component.appIcon).toBe('/fusion-assets/images/aastrika-foundation-logo.svg')

    component.isEkshamata = false
    component.ngOnInit()
    expect(component.appIcon).toBe('/fusion-assets/images/sphere-new-logo.svg')
  })


  it('should redirect to the correct route based on text', async () => {
    await component.redirect('home')
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/page/home')

    await component.redirect('mycourses')
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/user/my_courses')

    await component.redirect('competency')
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/user/competency')
    expect(localStorage.getItem('isOnlyPassbook')).toBe('false')

    await component.redirect('unknown')
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/profile-view')
  })

  it('should create account and navigate to create account page', () => {
    component.createAcct()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/create-account')
  })
})