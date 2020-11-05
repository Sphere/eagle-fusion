import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LearningHomeComponent } from './learning-home.component'

describe('LearningHomeComponent', () => {
  let component: LearningHomeComponent
  let fixture: ComponentFixture<LearningHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LearningHomeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
