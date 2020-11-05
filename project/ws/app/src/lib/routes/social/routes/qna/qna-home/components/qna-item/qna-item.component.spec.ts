import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { QnaItemComponent } from './qna-item.component'

describe('QnaItemComponent', () => {
  let component: QnaItemComponent
  let fixture: ComponentFixture<QnaItemComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QnaItemComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(QnaItemComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
