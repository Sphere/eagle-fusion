import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ModeratorTimelineComponent } from './moderator-timeline.component'

describe('ModeratorTimelineComponent', () => {
  let component: ModeratorTimelineComponent
  let fixture: ComponentFixture<ModeratorTimelineComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModeratorTimelineComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ModeratorTimelineComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
