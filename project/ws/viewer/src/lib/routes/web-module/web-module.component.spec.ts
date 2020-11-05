import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WebModuleComponent } from './web-module.component'

describe('WebModuleComponent', () => {
  let component: WebModuleComponent
  let fixture: ComponentFixture<WebModuleComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WebModuleComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WebModuleComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
