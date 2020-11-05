import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BpmDetailsComponent } from './bpm-details.component'

describe('BpmDetailsComponent', () => {
  let component: BpmDetailsComponent
  let fixture: ComponentFixture<BpmDetailsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BpmDetailsComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BpmDetailsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
