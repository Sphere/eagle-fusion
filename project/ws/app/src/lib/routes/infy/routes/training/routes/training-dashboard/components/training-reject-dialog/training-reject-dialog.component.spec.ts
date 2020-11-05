import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TrainingRejectDialogComponent } from './training-reject-dialog.component'

describe('TrainingRejectDialogComponent', () => {
  let component: TrainingRejectDialogComponent
  let fixture: ComponentFixture<TrainingRejectDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingRejectDialogComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingRejectDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
