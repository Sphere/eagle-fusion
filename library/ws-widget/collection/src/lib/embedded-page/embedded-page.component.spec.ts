import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { EmbeddedPageComponent } from './embedded-page.component'

describe('EmbeddedPageComponent', () => {
  let component: EmbeddedPageComponent
  let fixture: ComponentFixture<EmbeddedPageComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EmbeddedPageComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(EmbeddedPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
