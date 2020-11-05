import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AppTocDiscussionComponent } from './app-toc-discussion.component'

describe('AppTocDiscussionComponent', () => {
  let component: AppTocDiscussionComponent
  let fixture: ComponentFixture<AppTocDiscussionComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppTocDiscussionComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTocDiscussionComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
