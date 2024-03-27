import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { PublicTocBannerComponent } from './public-toc-banner.component'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { of } from 'rxjs'
import { Pipe, PipeTransform } from '@angular/core'
@Pipe({ name: 'pipeDurationTransform' })
class MockPipeDurationTransform implements PipeTransform {
  transform(value: any): any {
    return value
  }
}
describe('PublicTocBannerComponent', () => {
  let component: PublicTocBannerComponent
  let fixture: ComponentFixture<PublicTocBannerComponent>
  let httpClient: HttpClient
  let signUpService: SignupService
  let router: Router

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PublicTocBannerComponent, MockPipeDurationTransform],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [SignupService]
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicTocBannerComponent)
    component = fixture.componentInstance
    httpClient = TestBed.get(HttpClient)
    signUpService = TestBed.get(SignupService)
    router = TestBed.get(Router)
    spyOn(httpClient, 'get').and.returnValue(of({}))
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should fetch TOC config on init', fakeAsync(() => {
    component.ngOnInit()
    tick()
    expect(httpClient.get).toHaveBeenCalledWith('assets/configurations/feature/toc.json')
    expect(component.tocConfig).toEqual({})
  }))


  it('should show popup', () => {
    component.showPopup()
    expect(component.displayStyle).toBe('block')
  })

  it('should close popup', () => {
    component.closePopup()
    expect(component.displayStyle).toBe('none')
  })

  it('should call signUpSvc keyClockLogin method on login', () => {
    const signUpSvcSpy = spyOn(signUpService, 'keyClockLogin')
    component.login()
    expect(signUpSvcSpy).toHaveBeenCalled()
  })

  it('should navigate to create account page', () => {
    const routerSpy = spyOn(router, 'navigateByUrl')
    component.createAcct()
    expect(routerSpy).toHaveBeenCalledWith('app/create-account')
  })
})
