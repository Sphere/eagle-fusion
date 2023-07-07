import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WebPublicComponent } from './web-public-container.component'

describe('WebPublicComponent', () => {
  let component: WebPublicComponent
  let fixture: ComponentFixture<WebPublicComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WebPublicComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WebPublicComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
