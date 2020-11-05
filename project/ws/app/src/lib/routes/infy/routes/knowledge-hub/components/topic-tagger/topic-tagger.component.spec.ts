import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TopicTaggerComponent } from './topic-tagger.component'

describe('TopicTaggerComponent', () => {
  let component: TopicTaggerComponent
  let fixture: ComponentFixture<TopicTaggerComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TopicTaggerComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TopicTaggerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
