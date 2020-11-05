import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TrainingApprovalComponent } from './training-approval.component'

describe('TrainingApprovalComponent', () => {
  let component: TrainingApprovalComponent
  let fixture: ComponentFixture<TrainingApprovalComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingApprovalComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingApprovalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
