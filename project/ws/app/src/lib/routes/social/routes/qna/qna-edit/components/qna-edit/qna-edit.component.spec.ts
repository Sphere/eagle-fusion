import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { QnaEditComponent } from './qna-edit.component'

describe('QnaEditComponent', () => {
  let component: QnaEditComponent
  let fixture: ComponentFixture<QnaEditComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QnaEditComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(QnaEditComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
