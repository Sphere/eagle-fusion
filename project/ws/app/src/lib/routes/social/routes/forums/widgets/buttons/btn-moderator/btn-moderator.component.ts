import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { MatDialog } from '@angular/material'
import { SocialForum } from '../../../models/SocialForumposts.model'
import { DialogBoxModeratorComponent } from '../../Dialog-Box/dialog-box-moderator/dialog-box-moderator.component'
import { BtnModeratorService } from './btn-moderator.service'

// export interface DialogData {
//   animal: string
//   name: string
// }

@Component({
  selector: 'ws-app-btn-moderator',
  templateUrl: './btn-moderator.component.html',
  styleUrls: ['./btn-moderator.component.scss'],
})
export class BtnModeratorComponent implements OnInit {
  @Input()
  type: 'ACCEPT' | 'REJECT' | 'PENDING' = 'PENDING'
  @Input() postIdReceived = ''

  @Output()
  customevent: EventEmitter<string[]> = new EventEmitter<string[]>()
  // trying the given way
  reasonReceivedFromDialog = ''

  // sdkhhdhdkj moderatorBtnSvc
  timelineFetchStatus = ''
  constructor(
    private moderatorBtnSvc: BtnModeratorService,

    public dialog: MatDialog,
  ) {}
  moderatorRequest: SocialForum.IModeratorBtnRequest = {
    postId: '',
    action: SocialForum.EModeratorAction.ACCEPT,
  }
  moderatorRequestRejcetion: SocialForum.IModeratorBtnRequest = {
    postId: '',
    action: SocialForum.EModeratorAction.REJECT,
    userComment: {
      type: SocialForum.EModeratorReactComment.PREDEFINED,
      comment: '',
    },
  }

  errorMessage = ''
  postStatus = ''
  ngOnInit() {
    //// console.log("the type received is" + this.type)

    // if (this.configSvc.userProfile) {
    //   this.moderatorRequest.moderatorId = this.configSvc.userProfile.userId || ''
    // }
    if (this.postIdReceived) {
      // console.log("The postId received is" + this.postIdReceived)
      this.moderatorRequest.postId = this.postIdReceived
      this.moderatorRequestRejcetion.postId = this.postIdReceived
    }
  }
  accept() {
    //  event.stopPropagation()
    this.moderatorRequest.action = SocialForum.EModeratorAction.ACCEPT
    this.type = 'PENDING'

    // console.log("The post id in request is" + this.moderatorRequest.postId)
    // console.log("The type has been changed to pending on accepting to" + this.type)
    // console.log("The request is" + JSON.stringify(this.moderatorRequest))
    // console.log("The post id in request RETAINED is" + this.moderatorRequest.postId)
    this.moderatorBtnSvc.accept(this.moderatorRequest).subscribe(
      () => {
        // eventemitter to send postId to the parent so that it can be removed from the list temporarily
        // console.log("The response has been entered")
        this.postStatus = 'Successfully Accepted'
        this.customevent.emit([this.moderatorRequest.postId, this.postStatus])
      },
      () => {
        this.timelineFetchStatus = 'error'
      },
    )
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogBoxModeratorComponent, {
      data: {
        postId: this.moderatorRequestRejcetion.postId,
        type: 'moderate',
      },
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'error') {
        this.timelineFetchStatus = 'error'
      } else if (result) {
        this.customevent.emit([this.moderatorRequestRejcetion.postId, 'Successfully Rejected'])
      } else {
        this.type = 'REJECT'
      }
    })
  }

  reject() {
    // event.stopPropagation()
    this.moderatorRequest.action = SocialForum.EModeratorAction.REJECT
    this.type = 'PENDING'
    this.openDialog()
  }
}
