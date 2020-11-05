import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { ForumPostEditComponent } from './forum-post-edit.component'

describe('ForumPostEditComponent', () => {
  let component: ForumPostEditComponent
  let fixture: ComponentFixture<ForumPostEditComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ForumPostEditComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumPostEditComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
