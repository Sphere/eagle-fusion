import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnGoalsDialogComponent } from './btn-goals-dialog.component'

describe('BtnGoalsDialogComponent', () => {
  let component: BtnGoalsDialogComponent
  let fixture: ComponentFixture<BtnGoalsDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnGoalsDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnGoalsDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
