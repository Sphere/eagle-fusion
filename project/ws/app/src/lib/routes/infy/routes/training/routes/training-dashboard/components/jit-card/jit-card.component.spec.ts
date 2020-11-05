import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { JitCardComponent } from './jit-card.component'

describe('JitCardComponent', () => {
  let component: JitCardComponent
  let fixture: ComponentFixture<JitCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [JitCardComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(JitCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
