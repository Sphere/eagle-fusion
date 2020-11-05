import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AppTocHomeComponent } from './app-toc-home.component'

describe('AppTocHomeComponent', () => {
  let component: AppTocHomeComponent
  let fixture: ComponentFixture<AppTocHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppTocHomeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTocHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
