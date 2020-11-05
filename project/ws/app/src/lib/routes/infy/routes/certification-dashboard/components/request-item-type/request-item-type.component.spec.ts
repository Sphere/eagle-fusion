import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { RequestItemTypeComponent } from './request-item-type.component'

describe('RequestItemTypeComponent', () => {
  let component: RequestItemTypeComponent
  let fixture: ComponentFixture<RequestItemTypeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RequestItemTypeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestItemTypeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
