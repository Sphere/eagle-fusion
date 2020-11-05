import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AdminTimelineComponent } from './admin-timeline.component'

describe('AdminTimelineComponent', () => {
  let component: AdminTimelineComponent
  let fixture: ComponentFixture<AdminTimelineComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminTimelineComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTimelineComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
