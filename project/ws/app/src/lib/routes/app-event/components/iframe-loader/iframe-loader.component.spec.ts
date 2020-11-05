import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { IframeLoaderComponent } from './iframe-loader.component'

describe('IframeLoaderComponent', () => {
  let component: IframeLoaderComponent
  let fixture: ComponentFixture<IframeLoaderComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IframeLoaderComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(IframeLoaderComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
