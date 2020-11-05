import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TrainingShareDialogComponent } from './training-share-dialog.component'

describe('TrainingShareDialogComponent', () => {
  let component: TrainingShareDialogComponent
  let fixture: ComponentFixture<TrainingShareDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingShareDialogComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingShareDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
