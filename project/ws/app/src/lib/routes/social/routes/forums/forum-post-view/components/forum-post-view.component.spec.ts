import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { ForumPostViewComponent } from './forum-post-view.component'

describe('ForumPostViewComponent', () => {
  let component: ForumPostViewComponent
  let fixture: ComponentFixture<ForumPostViewComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ForumPostViewComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumPostViewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
