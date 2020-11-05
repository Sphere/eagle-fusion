import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnPlaylistDialogComponent } from './btn-playlist-dialog.component'

describe('BtnPlaylistDialogComponent', () => {
  let component: BtnPlaylistDialogComponent
  let fixture: ComponentFixture<BtnPlaylistDialogComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnPlaylistDialogComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnPlaylistDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
