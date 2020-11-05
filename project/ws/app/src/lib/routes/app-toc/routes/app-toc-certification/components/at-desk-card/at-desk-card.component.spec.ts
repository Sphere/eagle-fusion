import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AtDeskCardComponent } from './at-desk-card.component'

describe('AtDeskCardComponent', () => {
  let component: AtDeskCardComponent
  let fixture: ComponentFixture<AtDeskCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AtDeskCardComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AtDeskCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
