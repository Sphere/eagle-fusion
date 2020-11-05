import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { MediaWrapperComponent } from './media-wrapper.component'

describe('MediaWrapperComponent', () => {
  let component: MediaWrapperComponent
  let fixture: ComponentFixture<MediaWrapperComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MediaWrapperComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaWrapperComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
