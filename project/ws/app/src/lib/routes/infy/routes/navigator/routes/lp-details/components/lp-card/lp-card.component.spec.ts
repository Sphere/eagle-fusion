import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LpCardComponent } from './lp-card.component'

describe('LpCardComponent', () => {
  let component: LpCardComponent
  let fixture: ComponentFixture<LpCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LpCardComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LpCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
