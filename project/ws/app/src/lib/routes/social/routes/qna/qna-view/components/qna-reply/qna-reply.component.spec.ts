import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { QnaReplyComponent } from './qna-reply.component'

describe('QnaReplyComponent', () => {
  let component: QnaReplyComponent
  let fixture: ComponentFixture<QnaReplyComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QnaReplyComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(QnaReplyComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
