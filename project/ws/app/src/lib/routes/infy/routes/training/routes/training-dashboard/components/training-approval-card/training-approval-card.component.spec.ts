import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TrainingApprovalCardComponent } from './training-approval-card.component'

describe('TrainingApprovalCardComponent', () => {
  let component: TrainingApprovalCardComponent
  let fixture: ComponentFixture<TrainingApprovalCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingApprovalCardComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingApprovalCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
