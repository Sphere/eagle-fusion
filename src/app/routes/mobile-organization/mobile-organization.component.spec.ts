import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { MobileOrganizationComponent } from './mobile-organization.component'

describe('MobileOrganizationComponent', () => {
  let component: MobileOrganizationComponent
  let fixture: ComponentFixture<MobileOrganizationComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MobileOrganizationComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileOrganizationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
