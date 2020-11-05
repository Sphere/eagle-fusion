import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnContentShareComponent } from './btn-content-share.component'

describe('BtnContentShareComponent', () => {
  let component: BtnContentShareComponent
  let fixture: ComponentFixture<BtnContentShareComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnContentShareComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnContentShareComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
