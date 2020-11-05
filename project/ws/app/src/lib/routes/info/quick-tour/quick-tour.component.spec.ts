import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { QuickTourComponent } from './quick-tour.component'

describe('QuickTourComponent', () => {
  let component: QuickTourComponent
  let fixture: ComponentFixture<QuickTourComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [QuickTourComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickTourComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
