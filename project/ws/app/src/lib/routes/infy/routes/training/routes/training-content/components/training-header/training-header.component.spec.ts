import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TrainingHeaderComponent } from './training-header.component'

describe('TrainingHeaderComponent', () => {
  let component: TrainingHeaderComponent
  let fixture: ComponentFixture<TrainingHeaderComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingHeaderComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingHeaderComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
