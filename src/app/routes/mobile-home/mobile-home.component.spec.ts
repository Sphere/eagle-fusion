import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { MobileHomeComponent } from './mobile-home.component'

describe('MobileHomeComponent', () => {
  let component: MobileHomeComponent
  let fixture: ComponentFixture<MobileHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MobileHomeComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
