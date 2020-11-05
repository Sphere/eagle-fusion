import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnGoalsComponent } from './btn-goals.component'

describe('BtnGoalsComponent', () => {
  let component: BtnGoalsComponent
  let fixture: ComponentFixture<BtnGoalsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnGoalsComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnGoalsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
