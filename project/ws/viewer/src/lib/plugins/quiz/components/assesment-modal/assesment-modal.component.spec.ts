import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AssesmentModalComponent } from './assesment-modal.component'

describe('AssesmentModalComponent', () => {
  let component: AssesmentModalComponent
  let fixture: ComponentFixture<AssesmentModalComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssesmentModalComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AssesmentModalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
