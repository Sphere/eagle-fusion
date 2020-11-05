import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { EditBannersDialogComponent } from './edit-banners-dialog.component'

describe('EditBannersDialogComponent', () => {
  let component: EditBannersDialogComponent
  let fixture: ComponentFixture<EditBannersDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditBannersDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBannersDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
