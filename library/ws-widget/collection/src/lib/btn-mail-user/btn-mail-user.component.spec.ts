import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnMailUserComponent } from './btn-mail-user.component'

describe('BtnMailUserComponent', () => {
  let component: BtnMailUserComponent
  let fixture: ComponentFixture<BtnMailUserComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnMailUserComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnMailUserComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
