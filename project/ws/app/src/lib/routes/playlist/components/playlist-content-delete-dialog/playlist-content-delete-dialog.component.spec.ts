import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PlaylistContentDeleteDialogComponent } from './playlist-content-delete-dialog.component'

describe('PlaylistContentDeleteDialogComponent', () => {
  let component: PlaylistContentDeleteDialogComponent
  let fixture: ComponentFixture<PlaylistContentDeleteDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PlaylistContentDeleteDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistContentDeleteDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
