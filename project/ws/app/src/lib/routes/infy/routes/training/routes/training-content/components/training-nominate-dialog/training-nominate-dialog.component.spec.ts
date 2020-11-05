import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TrainingNominateDialogComponent } from './training-nominate-dialog.component'

describe('TrainingNominateDialogComponent', () => {
  let component: TrainingNominateDialogComponent
  let fixture: ComponentFixture<TrainingNominateDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingNominateDialogComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingNominateDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
