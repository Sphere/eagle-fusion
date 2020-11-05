import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnMailUserDialogComponent } from './btn-mail-user-dialog.component'

describe('BtnMailUserDialogComponent', () => {
  let component: BtnMailUserDialogComponent
  let fixture: ComponentFixture<BtnMailUserDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnMailUserDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnMailUserDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
