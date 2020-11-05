import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnPreviewDialogComponent } from './btn-preview-dialog.component'

describe('BtnPreviewDialogComponent', () => {
  let component: BtnPreviewDialogComponent
  let fixture: ComponentFixture<BtnPreviewDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnPreviewDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnPreviewDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
