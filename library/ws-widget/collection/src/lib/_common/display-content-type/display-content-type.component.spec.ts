import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DisplayContentTypeComponent } from './display-content-type.component'

describe('DisplayContentTypeComponent', () => {
  let component: DisplayContentTypeComponent
  let fixture: ComponentFixture<DisplayContentTypeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DisplayContentTypeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayContentTypeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
