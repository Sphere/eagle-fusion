import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { KnowledgeArtifactDetailsComponent } from './knowledge-artifact-details.component'

describe('KnowledgeArtifactDetailsComponent', () => {
  let component: KnowledgeArtifactDetailsComponent
  let fixture: ComponentFixture<KnowledgeArtifactDetailsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KnowledgeArtifactDetailsComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeArtifactDetailsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
