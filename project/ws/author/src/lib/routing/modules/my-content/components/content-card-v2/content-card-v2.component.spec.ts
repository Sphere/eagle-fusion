import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ContentCardV2Component } from './content-card-v2.component'

describe('ContentCardV2Component', () => {
  let component: ContentCardV2Component
  let fixture: ComponentFixture<ContentCardV2Component>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContentCardV2Component],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentCardV2Component)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
