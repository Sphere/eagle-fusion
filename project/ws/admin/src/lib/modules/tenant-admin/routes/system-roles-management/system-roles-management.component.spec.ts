import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SystemRolesManagementComponent } from './system-roles-management.component'

describe('SystemRolesManagementComponent', () => {
  let component: SystemRolesManagementComponent
  let fixture: ComponentFixture<SystemRolesManagementComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SystemRolesManagementComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemRolesManagementComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
