import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WorkInfoEditComponent } from './work-info-edit.component'

describe('WorkInfoEditComponent', () => {
  let component: WorkInfoEditComponent
  let fixture: ComponentFixture<WorkInfoEditComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WorkInfoEditComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkInfoEditComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
