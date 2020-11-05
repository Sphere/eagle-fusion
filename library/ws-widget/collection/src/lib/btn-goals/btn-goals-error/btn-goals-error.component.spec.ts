import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnGoalsErrorComponent } from './btn-goals-error.component'

describe('BtnGoalsErrorComponent', () => {
  let component: BtnGoalsErrorComponent
  let fixture: ComponentFixture<BtnGoalsErrorComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnGoalsErrorComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnGoalsErrorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
