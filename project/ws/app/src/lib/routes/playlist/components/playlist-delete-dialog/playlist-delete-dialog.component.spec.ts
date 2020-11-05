import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PlaylistDeleteDialogComponent } from './playlist-delete-dialog.component'

describe('PlaylistDeleteDialogComponent', () => {
  let component: PlaylistDeleteDialogComponent
  let fixture: ComponentFixture<PlaylistDeleteDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PlaylistDeleteDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistDeleteDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
