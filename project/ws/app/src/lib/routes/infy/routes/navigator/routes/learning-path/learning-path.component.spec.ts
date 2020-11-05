import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LearningPathComponent } from './learning-path.component'

describe('LearningPathComponent', () => {
  let component: LearningPathComponent
  let fixture: ComponentFixture<LearningPathComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LearningPathComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningPathComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
