import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { ForumPostReplyComponent } from './forum-post-reply.component'

describe('ForumPostReplyComponent', () => {
  let component: ForumPostReplyComponent
  let fixture: ComponentFixture<ForumPostReplyComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ForumPostReplyComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumPostReplyComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
