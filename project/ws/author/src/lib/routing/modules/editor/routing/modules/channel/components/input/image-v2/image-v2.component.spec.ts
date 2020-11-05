import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ImageV2Component } from './image-v2.component'

describe('ImageV2Component', () => {
  let component: ImageV2Component
  let fixture: ComponentFixture<ImageV2Component>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImageV2Component],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageV2Component)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
