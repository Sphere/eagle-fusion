import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PlaylistShareDialogComponent } from './playlist-share-dialog.component'

describe('PlaylistShareDialogComponent', () => {
  let component: PlaylistShareDialogComponent
  let fixture: ComponentFixture<PlaylistShareDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PlaylistShareDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistShareDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
