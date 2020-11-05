import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TrainingFilterDialogComponent } from './training-filter-dialog.component'

describe('TrainingFilterDialogComponent', () => {
  let component: TrainingFilterDialogComponent
  let fixture: ComponentFixture<TrainingFilterDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingFilterDialogComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingFilterDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
