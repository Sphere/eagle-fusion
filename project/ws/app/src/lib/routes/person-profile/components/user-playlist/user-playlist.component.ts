import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, OnChanges } from '@angular/core'
import { NsPlaylist } from '@ws-widget/collection'
import { Subscription } from 'rxjs'
import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils/src/public-api'
import { MatDialog, MatSnackBar } from '@angular/material'
import { PersonProfileService } from '../../services/person-profile.service'

@Component({
  selector: 'ws-app-user-playlist',
  templateUrl: './user-playlist.component.html',
  styleUrls: ['./user-playlist.component.scss'],
})
export class UserPlaylistComponent implements OnInit, OnChanges {
  @Input() wid = ''
  @Input() name = ''
  @Output() fetching = new EventEmitter<Boolean>()

  playlists: NsPlaylist.IPlaylist[] | null = null
  type: NsPlaylist.EPlaylistTypes = NsPlaylist.EPlaylistTypes.ME
  playlistsSubscription: Subscription | null = null
  suggestionsLimit = 4
  defaultThumbnail = ''
  playlistFetchStatus: TFetchStatus = 'none'
  isInitialized = false

  constructor(
    public configSvc: ConfigurationsService,
    private personProfileSvc: PersonProfileService,
    public dialog: MatDialog,
    private matSnackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
    }
    if (this.wid) { this.fetchPlaylists() }
  }
  ngOnChanges(changes: SimpleChanges) {
    if ((changes.wid.currentValue !== changes.wid.previousValue) && (this.isInitialized)) {
      this.wid = changes.wid.currentValue
      this.playlists = []
      this.fetchPlaylists()
    }
  }

  fetchPlaylists() {
    this.playlistFetchStatus = 'fetching'
    this.playlistsSubscription = this.personProfileSvc.getPlaylists(this.wid).subscribe(
      playlists => {
        this.playlists = playlists.user
        this.playlistFetchStatus = 'done'
        this.fetching.emit(true)
      },
      () => {
        this.playlistFetchStatus = 'error'
        this.openSnackBar('Error while fetching knowledge boards.')
        this.fetching.emit(true)
      })
  }

  private openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }

  // viewAllPlaylists() {
  //   this.dialog.open(UserdetailallComponent, {
  //     width: '70%',
  //     data: {
  //       tag: 'Playlists',
  //       content: this.playlists,
  //       name: 'Playlists',
  //     },
  //   })

  // }
}
