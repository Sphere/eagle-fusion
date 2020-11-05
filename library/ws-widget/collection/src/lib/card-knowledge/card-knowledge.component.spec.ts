import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CardKnowledgeComponent } from './card-knowledge.component'

describe('CardKnowledgeComponent', () => {
  let component: CardKnowledgeComponent
  let fixture: ComponentFixture<CardKnowledgeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CardKnowledgeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CardKnowledgeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
