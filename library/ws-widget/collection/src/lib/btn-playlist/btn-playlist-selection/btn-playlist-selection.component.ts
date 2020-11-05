import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { MatListOption, MatSnackBar } from '@angular/material'
import { EventService, TFetchStatus } from '@ws-widget/utils'
import { NsPlaylist } from '../btn-playlist.model'
import { BtnPlaylistService } from '../btn-playlist.service'

@Component({
  selector: 'ws-widget-btn-playlist-selection',
  templateUrl: './btn-playlist-selection.component.html',
  styleUrls: ['./btn-playlist-selection.component.scss'],
})
export class BtnPlaylistSelectionComponent implements OnInit {
  @ViewChild('contentAdd', { static: true }) contentAddMessage!: ElementRef<any>
  @ViewChild('contentRemove', { static: true }) contentRemoveMessage!: ElementRef<any>
  @ViewChild('playlistCreate', { static: true }) playlistCreate!: ElementRef<any>
  @ViewChild('contentUpdateError', { static: true }) contentUpdateError!: ElementRef<any>

  @Input() contentId!: string
  @Output() playlistCreateEvent = new EventEmitter()

  fetchPlaylistStatus: TFetchStatus = 'none'
  playlists: NsPlaylist.IPlaylist[] = []

  createPlaylistMode = false
  selectedPlaylists = new Set<string>()

  playlistNameFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(1),
    Validators.maxLength(100),
  ])

  constructor(
    private snackBar: MatSnackBar,
    private playlistSvc: BtnPlaylistService,
    private eventSvc: EventService,
  ) { }

  ngOnInit() {
    this.fetchPlaylistStatus = 'fetching'
    this.playlistSvc.getAllPlaylistsApi(false).subscribe(response => {
      this.fetchPlaylistStatus = 'done'
      this.playlists = response.user
      this.playlists = this.playlists.concat(response.share)
      this.playlists.forEach(playlist => {
        if (playlist.contents.map(content => content.identifier).includes(this.contentId)) {
          this.selectedPlaylists.add(playlist.id)
        }
      })
    })
  }

  selectionChange(option: MatListOption) {
    const playlistId = option.value
    const checked = option.selected
    const playlist = this.playlists.find(item => item.id === playlistId)
    if (playlist && checked) {
      this.raiseTelemetry('add', playlistId, this.contentId)
      this.playlistSvc.addPlaylistContent(playlist, [this.contentId]).subscribe(
        () => {
          this.snackBar.open(this.contentAddMessage.nativeElement.value)
          this.selectedPlaylists.add(playlistId)
        },
        _ => {
          this.snackBar.open(this.contentUpdateError.nativeElement.value)
          this.selectedPlaylists.delete(playlistId)
          option.toggle()
        },
      )
    } else if (playlist && !checked) {
      this.raiseTelemetry('remove', playlistId, this.contentId)
      this.playlistSvc.deletePlaylistContent(playlist, [this.contentId]).subscribe(
        () => {
          this.snackBar.open(this.contentRemoveMessage.nativeElement.value)
          this.selectedPlaylists.delete(playlistId)
        },
        _ => {
          this.snackBar.open(this.contentUpdateError.nativeElement.value)
          this.selectedPlaylists.add(playlistId)
          option.toggle()
        },
      )
    }
  }

  isDoneDisabled() {
   return this.selectedPlaylists.size > 0 ? false : true
  }

  createPlaylist(playlistName: string, successToast: string, errorToast: string) {
    this.playlistCreateEvent.emit()
    this.playlistSvc.upsertPlaylist(
      {
        playlist_title: playlistName,
        content_ids: [this.contentId],
        visibility: NsPlaylist.EPlaylistVisibilityTypes.PRIVATE,
      },
      false,
    )
      .subscribe(
        _ => {
          this.snackBar.open(successToast)
        },
        _ => {
          this.snackBar.open(errorToast)
        },
      )
  }

  raiseTelemetry(action: 'add' | 'remove', playlistId: string, contentId: string) {
    this.eventSvc.raiseInteractTelemetry('playlist', `btn-playlist-${action}`, {
      playlistId,
      contentId,
    })
  }
}
