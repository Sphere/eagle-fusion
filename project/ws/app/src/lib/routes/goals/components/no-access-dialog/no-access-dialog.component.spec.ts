import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { NoAccessDialogComponent } from './no-access-dialog.component'

describe('NoAccessDialogComponent', () => {
  let component: NoAccessDialogComponent
  let fixture: ComponentFixture<NoAccessDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NoAccessDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(NoAccessDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
