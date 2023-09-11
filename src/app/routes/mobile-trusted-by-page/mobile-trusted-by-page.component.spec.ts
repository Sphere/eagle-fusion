import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { MobileTrustedByPageComponent } from './mobile-trusted-by-page.component'

describe('MobileHomeComponent', () => {
  let component: MobileTrustedByPageComponent
  let fixture: ComponentFixture<MobileTrustedByPageComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MobileTrustedByPageComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileTrustedByPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
