import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnContentShareDialogComponent } from './btn-content-share-dialog.component'

describe('BtnContentShareDialogComponent', () => {
  let component: BtnContentShareDialogComponent
  let fixture: ComponentFixture<BtnContentShareDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnContentShareDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnContentShareDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
