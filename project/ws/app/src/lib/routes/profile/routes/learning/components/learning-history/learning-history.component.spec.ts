import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LearningHistoryComponent } from './learning-history.component'

describe('LearningHistoryComponent', () => {
  let component: LearningHistoryComponent
  let fixture: ComponentFixture<LearningHistoryComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LearningHistoryComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningHistoryComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
