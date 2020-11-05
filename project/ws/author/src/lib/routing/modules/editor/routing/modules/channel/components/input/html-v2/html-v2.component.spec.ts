import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { HtmlV2Component } from './html-v2.component'

describe('HtmlV2Component', () => {
  let component: HtmlV2Component
  let fixture: ComponentFixture<HtmlV2Component>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HtmlV2Component],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HtmlV2Component)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
