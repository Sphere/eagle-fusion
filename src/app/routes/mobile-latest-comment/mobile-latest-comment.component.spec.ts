import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { MobileLatestCommentComponent } from './mobile-latest-comment.component'

describe('MobileLatestCommentComponent', () => {
  let component: MobileLatestCommentComponent
  let fixture: ComponentFixture<MobileLatestCommentComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MobileLatestCommentComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileLatestCommentComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
