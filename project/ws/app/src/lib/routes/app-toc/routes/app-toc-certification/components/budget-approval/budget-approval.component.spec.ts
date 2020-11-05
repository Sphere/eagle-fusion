import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BudgetApprovalComponent } from './budget-approval.component'

describe('BudgetApprovalComponent', () => {
  let component: BudgetApprovalComponent
  let fixture: ComponentFixture<BudgetApprovalComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BudgetApprovalComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetApprovalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
