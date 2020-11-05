import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { RdbmsHandsOnComponent } from './rdbms-hands-on.component'

describe('RdbmsHandsOnComponent', () => {
  let component: RdbmsHandsOnComponent
  let fixture: ComponentFixture<RdbmsHandsOnComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RdbmsHandsOnComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RdbmsHandsOnComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
