import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MatDialog, MatSnackBar } from '@angular/material'
import { ActivatedRoute, Router } from '@angular/router'
import {
  BtnPlaylistService,
  NsContent,
  NsError,
  NsPlaylist,
  ROOT_WIDGET_CONFIG,
  viewerRouteGenerator,
  WidgetContentService,
} from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ConfigurationsService, NsPage, TFetchStatus, ValueService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
// tslint:disable-next-line:max-line-length
import { PlaylistContentDeleteDialogComponent } from '../../components/playlist-content-delete-dialog/playlist-content-delete-dialog.component'
// tslint:disable-next-line:max-line-length
import { PlaylistContentDeleteErrorDialogComponent } from '../../components/playlist-content-delete-error-dialog/playlist-content-delete-error-dialog.component'
import { PlaylistDeleteDialogComponent } from '../../components/playlist-delete-dialog/playlist-delete-dialog.component'
import { PlaylistShareDialogComponent } from '../../components/playlist-share-dialog/playlist-share-dialog.component'
import {
  PLAYLIST_TITLE_MAX_LENGTH,
  PLAYLIST_TITLE_MIN_LENGTH,
} from '../../constants/playlist.constant'

@Component({
  selector: 'ws-app-playlist-detail',
  templateUrl: './playlist-detail.component.html',
  styleUrls: ['./playlist-detail.component.scss'],
})
export class PlaylistDetailComponent implements OnInit, OnDestroy {
  @ViewChild('playlistDeleteFailed', { static: true }) playlistDeleteFailedMessage!: ElementRef<any>

  playlist: NsPlaylist.IPlaylist | null = this.route.snapshot.data.playlist.data
  type: NsPlaylist.EPlaylistTypes = this.route.snapshot.data.type
  error = this.route.snapshot.data.playlist.error

  isIntranetAllowedSettings = false
  playlistPlayLink: { url: string; queryParams: { [key: string]: any } } | null = null
  deletePlaylistStatus: TFetchStatus = 'none'
  addContentStatus: TFetchStatus = 'none'

  selectedContentIds = new Set<string>()
  fetchPlayerUrlStatus: TFetchStatus = 'none'
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar

  errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    widgetData: {
      errorType: 'internalServer',
    },
  }
  editPlaylistForm!: FormGroup
  changeName!: boolean
  defaultThumbnail = ''
  deletedContents = new Set()
  prefChangeSubscription: Subscription | null = null
  isShareEnabled = false
  isLtMedium$ = this.valueSvc.isLtMedium$
  screenSizeIsLtMedium = false
  screenSizeSubscription: Subscription | null = null

  constructor(
    fb: FormBuilder,
    private snackBar: MatSnackBar,
    public configSvc: ConfigurationsService,
    public contentSvc: WidgetContentService,
    private playlistSvc: BtnPlaylistService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    public router: Router,
    public valueSvc: ValueService
  ) {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
    }
    this.editPlaylistForm = fb.group({
      title: [
        this.playlist ? this.playlist.name : null,
        [
          Validators.required,
          Validators.minLength(PLAYLIST_TITLE_MIN_LENGTH),
          Validators.maxLength(PLAYLIST_TITLE_MAX_LENGTH),
        ],
      ],
      visibility: [NsPlaylist.EPlaylistVisibilityTypes.PRIVATE],
    })
  }

  ngOnInit() {
    if (this.configSvc.restrictedFeatures) {
      this.isShareEnabled = !this.configSvc.restrictedFeatures.has('share')
    }

    if (this.playlist) {
      // this.playlistSvc
      //   .getPlaylist(this.playlist.id, this.type, 'isInIntranet')
      //   .subscribe(playlist => {
      //     this.playlist = playlist
      //   })
      this.isIntranetAllowedSettings = this.configSvc.isIntranetAllowed
      this.prefChangeSubscription = this.configSvc.prefChangeNotifier.subscribe(() => {
        this.isIntranetAllowedSettings = this.configSvc.isIntranetAllowed
      })
      this.getPlayUrl()
    }
    this.isIntranetAllowedSettings = this.configSvc.isIntranetAllowed
    this.prefChangeSubscription = this.configSvc.prefChangeNotifier.subscribe(() => {
      this.isIntranetAllowedSettings = this.configSvc.isIntranetAllowed
    })
    this.screenSizeSubscription = this.isLtMedium$.subscribe((isLtMedium: boolean) => {
      this.screenSizeIsLtMedium = isLtMedium
    })
  }

  ngOnDestroy() {
    if (this.prefChangeSubscription) {
      this.prefChangeSubscription.unsubscribe()
    }
  }

  deletePlaylist() {
    const dialogRef = this.dialog.open(PlaylistDeleteDialogComponent)
    let routeTo: string
    this.type === 'user' ? (routeTo = 'me') : (routeTo = 'shared')
    dialogRef.afterClosed().subscribe(shouldDelete => {
      if (shouldDelete && this.playlist) {
        this.deletePlaylistStatus = 'fetching'
        this.playlistSvc.deletePlaylist(this.playlist.id, this.type).subscribe(
          () => {
            this.deletePlaylistStatus = 'done'
            this.router.navigate([`/app/playlist/${routeTo}`])
          },
          _err => {
            this.deletePlaylistStatus = 'error'
            this.snackBar.open(this.playlistDeleteFailedMessage.nativeElement.value)
          },
        )
      }
    })
  }

  editName(changeName: boolean) {
    const formValues: { [field: string]: string } = this.editPlaylistForm.getRawValue()
    if (formValues.title && this.playlist) {
      this.changeName = changeName
      if (!this.changeName) {
        this.playlist.name = formValues.title
        this.playlistSvc.patchPlaylist(this.playlist).subscribe()
      }
    }
  }

  cancelChange() {
    if (this.playlist) {
      this.changeName = false
      this.editPlaylistForm.patchValue({ title: this.playlist.name })
    }
  }

  deleteContent(identifier: string, name: string) {
    if (this.playlist && this.playlist.contents.length === 1) {
      this.dialog.open(PlaylistContentDeleteErrorDialogComponent)
      return
    }

    const dialogRef = this.dialog.open(PlaylistContentDeleteDialogComponent, {
      data: name,
    })

    dialogRef.afterClosed().subscribe(shouldDelete => {
      if (shouldDelete && this.playlist) {
        this.playlist.contents = this.playlist.contents.filter(
          item => item.identifier !== identifier,
        )
        this.playlistSvc.deletePlaylistContent(this.playlist, [identifier]).subscribe()
      }
    })
  }

  sharePlaylist() {
    this.dialog.open(PlaylistShareDialogComponent, {
      data: {
        playlist: this.playlist,
        deleted: [...this.deletedContents],
      },
      width: '600px',
    })
  }

  drop(event: CdkDragDrop<string[]>) {
    if (this.playlist) {
      moveItemInArray(this.playlist.contents, event.previousIndex, event.currentIndex)
      this.playlistSvc.patchPlaylist(this.playlist).subscribe()
    }
  }

  contentChanged(content: Partial<NsContent.IContent>, checked: boolean) {
    const id = content.identifier || ''
    checked ? this.selectedContentIds.add(id) : this.selectedContentIds.delete(id)
  }

  editPlaylist() {
    this.addContentStatus = 'fetching'
    if (this.playlist) {
      this.playlistSvc
        .addPlaylistContent(this.playlist, Array.from(this.selectedContentIds))
        .subscribe(
          () => {
            this.addContentStatus = 'done'
          },
          () => {
            this.addContentStatus = 'error'
          },
        )
    }
  }

  getPlayUrl() {
    if (this.playlist && this.playlist.contents && this.playlist.contents.length) {
      const playlist = this.playlist
      let id = playlist.contents[0].identifier
      this.contentSvc.fetchContentHistory(playlist.id).subscribe(data => {
        if (data) {
          id = data.identifier
        }
        this.contentSvc.fetchContent(id).subscribe(response => {
          if (response) {
            const firstPlayableContent = this.contentSvc.getFirstChildInHierarchy(response)
            this.playlistPlayLink = viewerRouteGenerator(
              firstPlayableContent.identifier,
              firstPlayableContent.mimeType,
              playlist.id,
              'Playlist',
              undefined,
              firstPlayableContent.primaryCategory
            )
          }
        })
      },                                                         _err => {
        this.contentSvc.fetchContent(playlist.contents[0].identifier).subscribe(response => {
          if (response) {
            const firstPlayableContent = this.contentSvc.getFirstChildInHierarchy(response)
            this.playlistPlayLink = viewerRouteGenerator(
              firstPlayableContent.identifier,
              firstPlayableContent.mimeType,
              playlist.id,
              'Playlist',
              undefined,
              firstPlayableContent.primaryCategory
            )
          }
        })
      })
    }
  }

  greyOut(content: NsContent.IContent) {
    return (
      this.isDeletedOrExpired(content) ||
      this.hasNoAccess(content) ||
      this.isInIntranetMobile(content)
    )
  }

  isInIntranetMobile(content: NsContent.IContent) {
    return !this.isIntranetAllowedSettings && content.isInIntranet
  }

  isDeletedOrExpired(content: NsContent.IContent): boolean | void {
    if (content.status === 'Expired' || content.status === 'Deleted') {
      this.deletedContents.add(content.name)
    }
    return content.status === 'Expired' || content.status === 'Deleted'
  }

  hasNoAccess(content: NsContent.IContent) {
    return !content.hasAccess
  }
}
