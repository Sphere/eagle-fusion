import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AppTocContentsComponent } from './app-toc-contents.component'

describe('AppTocContentsComponent', () => {
  let component: AppTocContentsComponent
  let fixture: ComponentFixture<AppTocContentsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppTocContentsComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTocContentsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
