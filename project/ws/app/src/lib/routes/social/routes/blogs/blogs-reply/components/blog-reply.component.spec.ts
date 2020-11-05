import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BlogReplyComponent } from './blog-reply.component'

describe('BlogReplyComponent', () => {
  let component: BlogReplyComponent
  let fixture: ComponentFixture<BlogReplyComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BlogReplyComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogReplyComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
