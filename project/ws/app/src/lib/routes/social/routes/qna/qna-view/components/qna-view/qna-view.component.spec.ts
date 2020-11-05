import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { QnaViewComponent } from './qna-view.component'

describe('QnaViewComponent', () => {
  let component: QnaViewComponent
  let fixture: ComponentFixture<QnaViewComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QnaViewComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(QnaViewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
