import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { MyBlogComponent } from './my-blog.component'

describe('MyBlogComponent', () => {
  let component: MyBlogComponent
  let fixture: ComponentFixture<MyBlogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyBlogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MyBlogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
