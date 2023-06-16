import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { WebHomeComponent } from './web-home.component'

describe('MobileHomeComponent', () => {
  let component: WebHomeComponent
  let fixture: ComponentFixture<WebHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WebHomeComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WebHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
