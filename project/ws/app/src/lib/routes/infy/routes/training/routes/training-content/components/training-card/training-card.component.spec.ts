import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TrainingCardComponent } from './training-card.component'

describe('TrainingCardComponent', () => {
  let component: TrainingCardComponent
  let fixture: ComponentFixture<TrainingCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingCardComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
