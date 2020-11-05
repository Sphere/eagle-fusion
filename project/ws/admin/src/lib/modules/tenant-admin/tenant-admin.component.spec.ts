import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TenantAdminComponent } from './tenant-admin.component'

describe('TenantAdminComponent', () => {
  let component: TenantAdminComponent
  let fixture: ComponentFixture<TenantAdminComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TenantAdminComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantAdminComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
