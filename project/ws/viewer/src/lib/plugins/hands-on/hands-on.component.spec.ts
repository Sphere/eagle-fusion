import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { HandsOnComponent } from './hands-on.component'

describe('HandsOnComponent', () => {
  let component: HandsOnComponent
  let fixture: ComponentFixture<HandsOnComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HandsOnComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HandsOnComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
