import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnAdminComponent } from './btn-admin.component'

describe('BtnAdminComponent', () => {
  let component: BtnAdminComponent
  let fixture: ComponentFixture<BtnAdminComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnAdminComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnAdminComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
