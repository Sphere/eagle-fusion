jest.mock('src/app/routes/signup/signup.service', () => ({
  SignupService: class {
    keyClockLogin = jest.fn()
  },
}))

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { PublicTocBannerComponent } from './public-toc-banner.component'
import { SignupService } from 'src/app/routes/signup/signup.service'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { of } from 'rxjs'
import { Pipe, PipeTransform } from '@angular/core'

@Pipe({ name: 'pipeDurationTransform', standalone: false })
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

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [PublicTocBannerComponent, MockPipeDurationTransform],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [SignupService],
    })
    TestBed.overrideComponent(PublicTocBannerComponent, { set: { template: '' } })
    await TestBed.compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicTocBannerComponent)
    component = fixture.componentInstance
    httpClient = TestBed.inject(HttpClient)
    signUpService = TestBed.inject(SignupService)
    router = TestBed.inject(Router)
    jest.spyOn(httpClient, 'get').mockReturnValue(of({}) as any)
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should fetch TOC config on init', fakeAsync(() => {
    component.ngOnInit()
    tick()
    expect(httpClient.get).toHaveBeenCalledWith('fusion-assets/files/toc.json')
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
    const signUpSvcSpy = jest.spyOn(signUpService, 'keyClockLogin')
    component.login()
    expect(signUpSvcSpy).toHaveBeenCalled()
  })

  it('should navigate to create account page', () => {
    const routerSpy = jest.spyOn(router, 'navigateByUrl').mockReturnValue(Promise.resolve(true))
    component.createAcct()
    expect(routerSpy).toHaveBeenCalledWith('app/create-account')
  })

  describe('authorName', () => {
    const details = [{ id: '28ec6b71', name: 'Jhpiego Cooperation' }]

    it('parses creatorDetails when the search API returns it as a JSON string', () => {
      component.content = { creatorDetails: JSON.stringify(details), creator: 'creatorjhpaastrika_0qfj' }
      expect(component.authorName).toBe('Jhpiego Cooperation')
    })

    it('reads creatorDetails when the content service returns it already parsed', () => {
      component.content = { creatorDetails: details, creator: 'creatorjhpaastrika_0qfj' }
      expect(component.authorName).toBe('Jhpiego Cooperation')
    })

    it('falls back to creator when creatorDetails is malformed', () => {
      component.content = { creatorDetails: '[{oops', creator: 'creatorjhpaastrika_0qfj' }
      expect(component.authorName).toBe('creatorjhpaastrika_0qfj')
    })

    it('falls back to creator when creatorDetails is absent', () => {
      component.content = { creator: 'creatorjhpaastrika_0qfj' }
      expect(component.authorName).toBe('creatorjhpaastrika_0qfj')
    })

    it('falls back to creator when creatorDetails carries no name', () => {
      component.content = { creatorDetails: [{ id: '28ec6b71' }], creator: 'creatorjhpaastrika_0qfj' }
      expect(component.authorName).toBe('creatorjhpaastrika_0qfj')
    })

    it('returns an empty string when there is nothing to show', () => {
      component.content = {}
      expect(component.authorName).toBe('')
    })

    it('does not throw when content is null', () => {
      component.content = null
      expect(component.authorName).toBe('')
    })
  })
})
