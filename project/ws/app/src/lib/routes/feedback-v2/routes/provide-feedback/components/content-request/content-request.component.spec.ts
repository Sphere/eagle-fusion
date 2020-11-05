import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ContentRequestComponent } from './content-request.component'

describe('ContentRequestComponent', () => {
  let component: ContentRequestComponent
  let fixture: ComponentFixture<ContentRequestComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContentRequestComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentRequestComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
