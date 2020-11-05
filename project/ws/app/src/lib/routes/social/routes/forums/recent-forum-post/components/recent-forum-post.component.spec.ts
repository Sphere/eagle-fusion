import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { RecentForumPostComponent } from './recent-forum-post.component'

describe('RecentForumPostComponent', () => {
  let component: RecentForumPostComponent
  let fixture: ComponentFixture<RecentForumPostComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecentForumPostComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentForumPostComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
