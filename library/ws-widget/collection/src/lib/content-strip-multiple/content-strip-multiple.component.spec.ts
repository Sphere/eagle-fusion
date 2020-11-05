import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ContentStripMultipleComponent } from './content-strip-multiple.component'

describe('ContentStripMultipleComponent', () => {
  let component: ContentStripMultipleComponent
  let fixture: ComponentFixture<ContentStripMultipleComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContentStripMultipleComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentStripMultipleComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
