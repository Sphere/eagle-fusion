import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnFacebookShareComponent } from './btn-facebook-share.component'

describe('BtnFacebookShareComponent', () => {
  let component: BtnFacebookShareComponent
  let fixture: ComponentFixture<BtnFacebookShareComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnFacebookShareComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnFacebookShareComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
