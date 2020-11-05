import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ContentAssignmentComponent } from './content-assignment.component'

describe('ContentAssignmentComponent', () => {
  let component: ContentAssignmentComponent
  let fixture: ComponentFixture<ContentAssignmentComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContentAssignmentComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentAssignmentComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
