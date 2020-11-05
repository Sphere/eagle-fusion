import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, OnChanges } from '@angular/core'
import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils'
import { NsContent } from '@ws-widget/collection'
import { NSProfileData } from '../../../profile/models/profile.model'
import { UserdetailallComponent } from '../userdetailall/userdetailall.component'
import { MatDialog, MatSnackBar } from '@angular/material'
import { PersonProfileService } from '../../services/person-profile.service'

@Component({
  selector: 'ws-app-user-kb',
  templateUrl: './user-kb.component.html',
  styleUrls: ['./user-kb.component.scss'],
})
export class UserKbComponent implements OnInit, OnChanges {
  @Input() wid = ''
  @Input() name = ''
  @Output() fetching = new EventEmitter<Boolean>()

  followingFetchStatus: TFetchStatus = 'none'
  followContent: NSProfileData.IFollowing[] = []
  following: NsContent.IContentMinimal[] = []

  defaultThumbnail = ''
  suggestionsLimit = 4
  isInitialized = false

  constructor(
    public configSvc: ConfigurationsService,
    private personProfileSvc: PersonProfileService,
    public dialog: MatDialog,
    private matSnackBar: MatSnackBar,
  ) {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
    }
  }

  ngOnInit() {
    if (this.wid) { this.followed() }
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.wid.currentValue !== changes.wid.previousValue) && (this.isInitialized)) {
      this.wid = changes.wid.currentValue
      this.following = []
      this.followed()
    }
  }

  followed() {
    this.followingFetchStatus = 'fetching'
    this.personProfileSvc.getFollowing(this.wid).subscribe(
      data => {
        this.followContent = data
        this.followContent.find(content => {
          this.following = content['Knowledge Board']
        })
        this.followingFetchStatus = 'done'
        this.fetching.emit(true)
      },
      _ => {
        this.followingFetchStatus = 'error'
        this.openSnackBar('Error while fetching knowledge boards.')
        this.fetching.emit(true)
      },
    )
  }

  private openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }

  viewAllKb() {
    this.dialog.open(UserdetailallComponent, {
      width: '70%',
      data: {
        tag: 'Knowledgeboard',
        content: this.following,
        name: 'Knowledge Boards',
      },
    })
  }

}
