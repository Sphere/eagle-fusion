import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LearningHubHomeComponent } from './home.component'

describe('LearningHubHomeComponent', () => {
  let component: LearningHubHomeComponent
  let fixture: ComponentFixture<LearningHubHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LearningHubHomeComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningHubHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
