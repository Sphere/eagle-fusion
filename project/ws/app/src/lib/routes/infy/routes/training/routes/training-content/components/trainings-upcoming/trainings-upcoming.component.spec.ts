import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TrainingsUpcomingComponent } from './trainings-upcoming.component'

describe('TrainingsUpcomingComponent', () => {
  let component: TrainingsUpcomingComponent
  let fixture: ComponentFixture<TrainingsUpcomingComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingsUpcomingComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingsUpcomingComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
