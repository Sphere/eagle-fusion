import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ContentStripV2Component } from './content-strip-v2.component'

describe('ContentStripV2Component', () => {
  let component: ContentStripV2Component
  let fixture: ComponentFixture<ContentStripV2Component>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContentStripV2Component],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentStripV2Component)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
