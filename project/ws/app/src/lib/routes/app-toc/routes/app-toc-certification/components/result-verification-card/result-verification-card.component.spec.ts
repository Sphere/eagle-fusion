import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ResultVerificationCardComponent } from './result-verification-card.component'

describe('ResultVerificationCardComponent', () => {
  let component: ResultVerificationCardComponent
  let fixture: ComponentFixture<ResultVerificationCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ResultVerificationCardComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultVerificationCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
