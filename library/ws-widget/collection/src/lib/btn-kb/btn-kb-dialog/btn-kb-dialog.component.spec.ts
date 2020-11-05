import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnKbDialogComponent } from './btn-kb-dialog.component'

describe('BtnKbDialogComponent', () => {
  let component: BtnKbDialogComponent
  let fixture: ComponentFixture<BtnKbDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnKbDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnKbDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
