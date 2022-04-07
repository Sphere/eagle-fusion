import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { MobileProfilePopupComponent } from './mobile-profile-popup.component'

describe('MobileProfilePopupComponent', () => {
  let component: MobileProfilePopupComponent
  let fixture: ComponentFixture<MobileProfilePopupComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MobileProfilePopupComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileProfilePopupComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
