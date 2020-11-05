import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ApprovalCardComponent } from './approval-card.component'

describe('ApprovalCardComponent', () => {
  let component: ApprovalCardComponent
  let fixture: ComponentFixture<ApprovalCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApprovalCardComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovalCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
