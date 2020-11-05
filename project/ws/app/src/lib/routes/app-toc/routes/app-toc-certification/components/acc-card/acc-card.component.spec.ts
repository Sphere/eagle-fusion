import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AccCardComponent } from './acc-card.component'

describe('AccCardComponent', () => {
  let component: AccCardComponent
  let fixture: ComponentFixture<AccCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccCardComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AccCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
