import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ForumEditComponent } from './forum-edit.component'

describe('ForumEditComponent', () => {
  let component: ForumEditComponent
  let fixture: ComponentFixture<ForumEditComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ForumEditComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumEditComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
