import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AssignmentDetailsComponent } from './assignment-details.component'

describe('AssignmentDetailsComponent', () => {
  let component: AssignmentDetailsComponent
  let fixture: ComponentFixture<AssignmentDetailsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssignmentDetailsComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentDetailsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
