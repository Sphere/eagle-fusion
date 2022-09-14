import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AlmostDoneComponent } from './almost-done.component'

describe('AlmostDoneComponent', () => {
  let component: AlmostDoneComponent
  let fixture: ComponentFixture<AlmostDoneComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AlmostDoneComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AlmostDoneComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
