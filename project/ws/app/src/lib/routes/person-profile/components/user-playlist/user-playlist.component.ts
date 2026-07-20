import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, OnChanges } from '@angular/core'
import { Subscription } from 'rxjs'
import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils/src/public-api'

@Component({
    standalone: false,
    selector: 'ws-app-user-playlist',
    templateUrl: './user-playlist.component.html',
    styleUrls: ['./user-playlist.component.scss'],
    
})
export class UserPlaylistComponent implements OnInit, OnChanges {
  @Input() wid = ''
  @Input() name = ''
  @Output() fetching = new EventEmitter<boolean>()

  playlistsSubscription: Subscription | null = null
  suggestionsLimit = 4
  defaultThumbnail = ''
  playlistFetchStatus: TFetchStatus = 'none'
  isInitialized = false

  constructor(
    public configSvc: ConfigurationsService,
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
      this.fetchPlaylists()
    }
  }

  fetchPlaylists() {
    this.playlistFetchStatus = 'fetching'
  }
}
