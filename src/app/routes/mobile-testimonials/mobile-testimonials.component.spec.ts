import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { MobileTestimonialsComponent } from './mobile-testimonials.component'

describe('MobileHomeComponent', () => {
  let component: MobileTestimonialsComponent
  let fixture: ComponentFixture<MobileTestimonialsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MobileTestimonialsComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileTestimonialsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
