import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PlaylistContentDeleteErrorDialogComponent } from './playlist-content-delete-error-dialog.component'

describe('PlaylistContentDeleteErrorDialogComponent', () => {
  let component: PlaylistContentDeleteErrorDialogComponent
  let fixture: ComponentFixture<PlaylistContentDeleteErrorDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PlaylistContentDeleteErrorDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistContentDeleteErrorDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
