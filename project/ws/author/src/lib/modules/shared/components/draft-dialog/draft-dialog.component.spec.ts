import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DraftDialogComponent } from './draft-dialog.component'

describe('DraftDialogComponent', () => {
  let component: DraftDialogComponent
  let fixture: ComponentFixture<DraftDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DraftDialogComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DraftDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
