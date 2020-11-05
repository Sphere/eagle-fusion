import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { HandsOnDialogComponent } from './hands-on-dialog.component'

describe('HandsOnDialogComponent', () => {
  let component: HandsOnDialogComponent
  let fixture: ComponentFixture<HandsOnDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HandsOnDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HandsOnDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
