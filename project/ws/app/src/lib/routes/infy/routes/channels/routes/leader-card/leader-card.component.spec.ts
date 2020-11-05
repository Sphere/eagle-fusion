import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LeaderCardComponent } from './leader-card.component'

describe('LeaderCardComponent', () => {
  let component: LeaderCardComponent
  let fixture: ComponentFixture<LeaderCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LeaderCardComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaderCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
