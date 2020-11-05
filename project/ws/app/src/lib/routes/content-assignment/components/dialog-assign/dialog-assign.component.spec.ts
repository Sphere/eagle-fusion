import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DialogAssignComponent } from './dialog-assign.component'

describe('DialogAssignComponent', () => {
  let component: DialogAssignComponent
  let fixture: ComponentFixture<DialogAssignComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DialogAssignComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAssignComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
