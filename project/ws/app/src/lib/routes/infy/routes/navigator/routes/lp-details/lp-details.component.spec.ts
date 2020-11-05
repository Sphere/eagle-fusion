import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LpDetailsComponent } from './lp-details.component'

describe('LpDetailsComponent', () => {
  let component: LpDetailsComponent
  let fixture: ComponentFixture<LpDetailsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LpDetailsComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LpDetailsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
