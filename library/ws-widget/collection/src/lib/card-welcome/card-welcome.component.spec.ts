import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CardWelcomeComponent } from './card-welcome.component'

describe('CardWelcomeComponent', () => {
  let component: CardWelcomeComponent
  let fixture: ComponentFixture<CardWelcomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CardWelcomeComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CardWelcomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
