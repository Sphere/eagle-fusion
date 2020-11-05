import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { RolesManagementDetailComponent } from './roles-management-detail.component'

describe('RolesManagementDetailComponent', () => {
  let component: RolesManagementDetailComponent
  let fixture: ComponentFixture<RolesManagementDetailComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RolesManagementDetailComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RolesManagementDetailComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
