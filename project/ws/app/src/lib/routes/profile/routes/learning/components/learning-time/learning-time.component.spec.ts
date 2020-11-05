import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LearningTimeComponent } from './learning-time.component'

describe('LearningTimeComponent', () => {
  let component: LearningTimeComponent
  let fixture: ComponentFixture<LearningTimeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LearningTimeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningTimeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
