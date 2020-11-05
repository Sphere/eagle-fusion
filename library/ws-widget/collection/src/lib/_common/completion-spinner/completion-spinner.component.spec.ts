import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CompletionSpinnerComponent } from './completion-spinner.component'

describe('CompletionSpinnerComponent', () => {
  let component: CompletionSpinnerComponent
  let fixture: ComponentFixture<CompletionSpinnerComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CompletionSpinnerComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CompletionSpinnerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
