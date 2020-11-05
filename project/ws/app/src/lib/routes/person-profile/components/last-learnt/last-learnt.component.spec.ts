import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LastLearntComponent } from './last-learnt.component'

describe('LastLearntComponent', () => {
  let component: LastLearntComponent
  let fixture: ComponentFixture<LastLearntComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LastLearntComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LastLearntComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
