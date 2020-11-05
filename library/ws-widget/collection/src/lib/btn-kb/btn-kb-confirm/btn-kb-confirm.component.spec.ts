import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnKbConfirmComponent } from './btn-kb-confirm.component'

describe('BtnKbConfirmComponent', () => {
  let component: BtnKbConfirmComponent
  let fixture: ComponentFixture<BtnKbConfirmComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnKbConfirmComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnKbConfirmComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
