import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { MultilineSnackbarComponent } from './multiline-snackbar.component'

describe('MultilineSnackbarComponent', () => {
  let component: MultilineSnackbarComponent
  let fixture: ComponentFixture<MultilineSnackbarComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MultilineSnackbarComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MultilineSnackbarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
