import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ImageMapResponsiveComponent } from './image-map-responsive.component'

describe('ImageMapResponsiveComponent', () => {
  let component: ImageMapResponsiveComponent
  let fixture: ComponentFixture<ImageMapResponsiveComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImageMapResponsiveComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageMapResponsiveComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
