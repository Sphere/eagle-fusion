import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { WebTrustedByPageComponent } from './web-trusted-by-page.component'

describe('MobileHomeComponent', () => {
  let component: WebTrustedByPageComponent
  let fixture: ComponentFixture<WebTrustedByPageComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WebTrustedByPageComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WebTrustedByPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
