import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DndSnippetComponent } from './dnd-snippet.component'

describe('DndSnippetComponent', () => {
  let component: DndSnippetComponent
  let fixture: ComponentFixture<DndSnippetComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DndSnippetComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DndSnippetComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
