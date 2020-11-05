import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { ForumPostResultComponent } from './forum-post-result.component'

describe('ForumPostResultComponent', () => {
  let component: ForumPostResultComponent
  let fixture: ComponentFixture<ForumPostResultComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ForumPostResultComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumPostResultComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
