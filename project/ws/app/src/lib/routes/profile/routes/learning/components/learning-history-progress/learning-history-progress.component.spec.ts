import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LearningHistoryProgressComponent } from './learning-history-progress.component'

describe('LearningHistoryProgressComponent', () => {
  let component: LearningHistoryProgressComponent
  let fixture: ComponentFixture<LearningHistoryProgressComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LearningHistoryProgressComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningHistoryProgressComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
