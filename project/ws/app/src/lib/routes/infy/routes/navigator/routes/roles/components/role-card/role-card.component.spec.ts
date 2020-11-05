import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { RoleCardComponent } from './role-card.component'

describe('RoleCardComponent', () => {
  let component: RoleCardComponent
  let fixture: ComponentFixture<RoleCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RoleCardComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
