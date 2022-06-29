import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CloseAssesmentModalComponent } from './close-assesment-modal.component'

describe('CloseAssesmentModalComponent', () => {
  let component: CloseAssesmentModalComponent
  let fixture: ComponentFixture<CloseAssesmentModalComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CloseAssesmentModalComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseAssesmentModalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
