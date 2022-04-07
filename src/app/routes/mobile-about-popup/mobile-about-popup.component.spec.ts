import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { MobileAboutPopupComponent } from './mobile-about-popup.component'

describe('MobileAboutPopupComponent', () => {
  let component: MobileAboutPopupComponent
  let fixture: ComponentFixture<MobileAboutPopupComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MobileAboutPopupComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileAboutPopupComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
