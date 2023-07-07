import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { WebNavLinkPageComponent } from './web-nav-link-page.component'

describe('MobileHomeComponent', () => {
  let component: WebNavLinkPageComponent
  let fixture: ComponentFixture<WebNavLinkPageComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WebNavLinkPageComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WebNavLinkPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
