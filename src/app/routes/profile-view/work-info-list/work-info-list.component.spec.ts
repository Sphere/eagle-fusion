import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WorkInfoListComponent } from './work-info-list.component'

describe('WorkInfoListComponent', () => {
  let component: WorkInfoListComponent
  let fixture: ComponentFixture<WorkInfoListComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WorkInfoListComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkInfoListComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
