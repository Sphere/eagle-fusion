import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnGoalsSelectionComponent } from './btn-goals-selection.component'

describe('BtnGoalsSelectionComponent', () => {
  let component: BtnGoalsSelectionComponent
  let fixture: ComponentFixture<BtnGoalsSelectionComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnGoalsSelectionComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnGoalsSelectionComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
