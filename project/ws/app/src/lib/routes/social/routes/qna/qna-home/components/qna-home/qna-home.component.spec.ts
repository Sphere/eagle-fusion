import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { QnaHomeComponent } from './qna-home.component'

describe('QnaHomeComponent', () => {
  let component: QnaHomeComponent
  let fixture: ComponentFixture<QnaHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QnaHomeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(QnaHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
