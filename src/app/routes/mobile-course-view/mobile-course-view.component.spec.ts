import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { MobileCourseViewComponent } from './mobile-course-view.component'

describe('MobileCourseViewComponent', () => {
  let component: MobileCourseViewComponent
  let fixture: ComponentFixture<MobileCourseViewComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MobileCourseViewComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileCourseViewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
