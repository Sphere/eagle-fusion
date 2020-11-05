import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BadgesNotEarnedComponent } from './badges-not-earned.component'

describe('BadgesNotEarnedComponent', () => {
  let component: BadgesNotEarnedComponent
  let fixture: ComponentFixture<BadgesNotEarnedComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BadgesNotEarnedComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgesNotEarnedComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
