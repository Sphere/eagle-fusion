import { Component, OnInit, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { SocialForum } from '../../../models/SocialForumposts.model'
import { BtnFlagService } from '../../buttons/btn-flag/btn-flag.service'
import { BtnModeratorService } from '../../buttons/btn-moderator/btn-moderator.service'
// import { DialogData } from '../../buttons/btn-moderator/btn-moderator.component'

@Component({
  selector: 'ws-app-dialog-box-moderator',
  templateUrl: './dialog-box-moderator.component.html',
  styleUrls: ['./dialog-box-moderator.component.scss'],
})
export class DialogBoxModeratorComponent implements OnInit {
  confirmButtonStatus = true
  selectedType = ''
  type = ''
  postId = ''
  flagRequest: SocialForum.IFlagRequest = {
    id: '',
    activityType: SocialForum.EUserActivity.FLAG,
    userComment: {
      commentType: SocialForum.EModeratorReactComment.PREDEFINED,
      comment: '',
    },
  }
  moderatorRejectRequest: SocialForum.IModeratorBtnRequest = {
    postId: '',
    action: SocialForum.EModeratorAction.REJECT,
    userComment: {
      type: SocialForum.EModeratorReactComment.PREDEFINED,
      comment: '',
    },
  }
  reason = ''
  flagReason = ''
  flagTypes: string[] = [
    'Inappropriate Content',
    'Content Not Original',
    'Irrelevant Content',
    'Spam',
  ]
  constructor(
    @Inject(MAT_DIALOG_DATA)
    data: {
      postId: string
      type: string
    },
    private flagSvc: BtnFlagService,
    private moderatorBtnSvc: BtnModeratorService,
    public dialogRef: MatDialogRef<DialogBoxModeratorComponent>,
  ) {
    if (data.type) {
      this.type = data.type
      this.moderatorRejectRequest.postId = data.postId
    } else {
      this.type = 'flag'
      this.flagRequest.id = data.postId
    }
  }

  ngOnInit() {}

  confirmed() {
    if (this.selectedType !== '') {
      if (this.selectedType === 'Inappropriate Content') {
        this.flagReason = 'INAPPROPRIATE_CONTENT'
      } else if (this.selectedType === 'Content Not Original') {
        this.flagReason = SocialForum.EFlagReason.CONTENT_NOT_ORIGINAL
      } else if (this.selectedType === 'Irrelevant Content') {
        this.flagReason = SocialForum.EFlagReason.IRRELEVANT_CONTENT
      } else if (this.selectedType === 'Inappropriate Content') {
        this.flagReason = SocialForum.EFlagReason.INAPPROPRIATE_CONTENT
      } else if (this.selectedType === 'Spam') {
        this.flagReason = SocialForum.EFlagReason.SPAM
      }

      if (this.type === 'moderate') {
        if (this.moderatorRejectRequest.userComment) {
          this.moderatorRejectRequest.userComment.comment = this.flagReason
        }
        this.moderatorBtnSvc.reject(this.moderatorRejectRequest).subscribe(
          () => {
            this.dialogRef.close(true)
          },
          () => {
            this.dialogRef.close('error')
          },
        )
      } else {
        if (this.flagRequest.userComment) {
          this.flagRequest.userComment.comment = this.flagReason
        }
        this.flagSvc.flagPost(this.flagRequest).subscribe(
          () => {
            this.dialogRef.close(true)
          },
          () => {
            this.dialogRef.close(false)
          },
        )
      }
    }
  }

  changeButtonStatus() {
    this.confirmButtonStatus = false
  }
}
