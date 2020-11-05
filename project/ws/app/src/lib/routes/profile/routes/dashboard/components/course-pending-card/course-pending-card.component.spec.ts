import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CoursePendingCardComponent } from './course-pending-card.component'

describe('CoursePendingCardComponent', () => {
  let component: CoursePendingCardComponent
  let fixture: ComponentFixture<CoursePendingCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CoursePendingCardComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursePendingCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
