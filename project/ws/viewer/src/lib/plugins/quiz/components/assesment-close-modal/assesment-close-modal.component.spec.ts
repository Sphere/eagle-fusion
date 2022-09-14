import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AssesmentCloseModalComponent } from './assesment-close-modal.component'

describe('AssesmentCloseModalComponent', () => {
  let component: AssesmentCloseModalComponent
  let fixture: ComponentFixture<AssesmentCloseModalComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssesmentCloseModalComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AssesmentCloseModalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
