import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BlogResultComponent } from './blog-result.component'

describe('BlogResultComponent', () => {
  let component: BlogResultComponent
  let fixture: ComponentFixture<BlogResultComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BlogResultComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogResultComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
