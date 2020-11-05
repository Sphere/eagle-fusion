import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GalleryWidgetComponent } from './gallery-widget.component'

describe('GalleryWidgetComponent', () => {
  let component: GalleryWidgetComponent
  let fixture: ComponentFixture<GalleryWidgetComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GalleryWidgetComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GalleryWidgetComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
