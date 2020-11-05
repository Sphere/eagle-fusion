import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnLinkedinShareComponent } from './btn-linkedin-share.component'

describe('BtnLinkedinShareComponent', () => {
  let component: BtnLinkedinShareComponent
  let fixture: ComponentFixture<BtnLinkedinShareComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnLinkedinShareComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnLinkedinShareComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
