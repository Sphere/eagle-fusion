import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ProjectSnapshotComponent } from './project-snapshot.component'

describe('ProjectSnapshotComponent', () => {
  let component: ProjectSnapshotComponent
  let fixture: ComponentFixture<ProjectSnapshotComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectSnapshotComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectSnapshotComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
