import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { FaqHomeComponent } from './faq-home.component'

describe('FaqHomeComponent', () => {
  let component: FaqHomeComponent
  let fixture: ComponentFixture<FaqHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FaqHomeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
