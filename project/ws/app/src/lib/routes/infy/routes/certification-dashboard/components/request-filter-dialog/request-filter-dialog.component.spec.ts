import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { RequestFilterDialogComponent } from './request-filter-dialog.component'

describe('RequestFilterDialogComponent', () => {
  let component: RequestFilterDialogComponent
  let fixture: ComponentFixture<RequestFilterDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RequestFilterDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestFilterDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
