import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnContentMailMeDialogComponent } from './btn-content-mail-me-dialog.component'

describe('BtnContentMailMeDialogComponent', () => {
  let component: BtnContentMailMeDialogComponent
  let fixture: ComponentFixture<BtnContentMailMeDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnContentMailMeDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnContentMailMeDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
