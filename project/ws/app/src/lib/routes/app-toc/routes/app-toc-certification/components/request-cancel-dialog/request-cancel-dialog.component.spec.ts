import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { RequestCancelDialogComponent } from './request-cancel-dialog.component'

describe('RequestCancelDialogComponent', () => {
  let component: RequestCancelDialogComponent
  let fixture: ComponentFixture<RequestCancelDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RequestCancelDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestCancelDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
