import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AppTocDialogIntroVideoComponent } from './app-toc-dialog-intro-video.component'

describe('AppTocDialogIntroVideoComponent', () => {
  let component: AppTocDialogIntroVideoComponent
  let fixture: ComponentFixture<AppTocDialogIntroVideoComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppTocDialogIntroVideoComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTocDialogIntroVideoComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
