import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { QandaCardComponent } from './qanda-card.component'

describe('QandaCardComponent', () => {
  let component: QandaCardComponent
  let fixture: ComponentFixture<QandaCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QandaCardComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(QandaCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
