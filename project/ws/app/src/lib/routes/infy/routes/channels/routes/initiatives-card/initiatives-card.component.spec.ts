import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { InitiativesCardComponent } from './initiatives-card.component'

describe('InitiativesCardComponent', () => {
  let component: InitiativesCardComponent
  let fixture: ComponentFixture<InitiativesCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InitiativesCardComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(InitiativesCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
