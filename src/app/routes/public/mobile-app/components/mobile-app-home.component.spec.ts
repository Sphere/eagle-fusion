import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { MobileAppHomeComponent } from './mobile-app-home.component'

describe('MobileAppHomeComponent', () => {
  let component: MobileAppHomeComponent
  let fixture: ComponentFixture<MobileAppHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MobileAppHomeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileAppHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
