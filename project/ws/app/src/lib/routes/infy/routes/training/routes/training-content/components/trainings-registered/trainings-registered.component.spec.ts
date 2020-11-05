import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TrainingsRegisteredComponent } from './trainings-registered.component'

describe('TrainingsRegisteredComponent', () => {
  let component: TrainingsRegisteredComponent
  let fixture: ComponentFixture<TrainingsRegisteredComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingsRegisteredComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingsRegisteredComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
