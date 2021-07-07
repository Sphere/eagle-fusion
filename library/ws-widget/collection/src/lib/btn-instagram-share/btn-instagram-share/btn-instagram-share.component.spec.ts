import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnInstagramShareComponent } from './btn-instagram-share.component'

describe('BtnInstagramShareComponent', () => {
  let component: BtnInstagramShareComponent
  let fixture: ComponentFixture<BtnInstagramShareComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnInstagramShareComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnInstagramShareComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
