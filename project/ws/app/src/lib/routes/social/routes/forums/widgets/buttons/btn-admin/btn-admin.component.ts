import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { MatDialog } from '@angular/material'
import { SocialForum } from '../../../models/SocialForumposts.model'
import { DialogBoxAdminAcceptComponent } from '../../Dialog-Box/dialog-box-admin-accept/dialog-box-admin-accept.component'
import { DialogBoxAdminComponent } from '../../Dialog-Box/dialog-box-admin/dialog-box-admin.component'
import { DialogBoxModeratorComponent } from '../../Dialog-Box/dialog-box-moderator/dialog-box-moderator.component'
import { BtnAdminService } from './btn-admin.service'

@Component({
  selector: 'ws-app-btn-admin',
  templateUrl: './btn-admin.component.html',
  styleUrls: ['./btn-admin.component.scss'],
})
export class BtnAdminComponent implements OnInit {
  constructor(
    public adminServ: BtnAdminService,
    public dialog: MatDialog,
  ) { }
  @Input()
  type: 'ACCEPT' | 'FLAGGEDACCEPT' | 'REJECT' | 'PENDING' = 'PENDING'
  @Input() postIdReceived = ''

  @Output()
  customevent: EventEmitter<string[]> = new EventEmitter<string[]>()
  // trying the given way
  reasonReceivedFromDialog = ''

  // sdkhhdhdkj moderatorBtnSvc
  timelineFetchStatus = ''
  adminRejectionRequest: SocialForum.IAdminBtnRequest = {

    id: '',

    userComment: {

      comment: '',

    },
  }
  @Output() messageEvent = new EventEmitter<string>()
  @Output() revivedId = new EventEmitter<string>()
  @Output() acceptedFlaggedId = new EventEmitter<string>()
  adminReviveRequest: SocialForum.IAdminRevivePostRequest = {
    id: '',
    reactivateReason: ' ',
  }

  // Admin Reactivate deleted post
  reasonOfRevival = ''

  ngOnInit() {
    if (this.postIdReceived) {
      // console.log("The postId received is" + this.postIdReceived)
      // this.moderatorRequest.postId = this.postIdReceived
      this.adminRejectionRequest.id = this.postIdReceived
    }
  }
  reject() {
    // event.stopPropagation()

    this.type = 'PENDING'
    this.openDialog()

  }
  openDialog(): void {
    const dialogRef = this.dialog.open(DialogBoxModeratorComponent)

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed')
      // console.log("The result in dialog box is " + result)
      //    this.reasonReceivedFromDialog = result

      if (result === 'Inappropriate Content') {
        // console.log("THE FAVORITE SEASON IS CHECKED")
        this.reasonReceivedFromDialog = 'INAPPROPRIATE_CONTENT'
      } else if (result === 'Content Not Original') {
        this.reasonReceivedFromDialog = SocialForum.EFlagReason.CONTENT_NOT_ORIGINAL
      } else if (result === 'Irrelevant Content') {
        this.reasonReceivedFromDialog = SocialForum.EFlagReason.IRRELEVANT_CONTENT
      } else if (result === 'Inappropriate Content') {
        this.reasonReceivedFromDialog = SocialForum.EFlagReason.INAPPROPRIATE_CONTENT
      }
      if (this.adminRejectionRequest.userComment) {

        this.adminRejectionRequest.userComment.comment = this.reasonReceivedFromDialog
      }
      if (this.reasonReceivedFromDialog !== '') {
        this.adminServ.reject(this.adminRejectionRequest).subscribe(

          () => {
            // console.log("API REJECTION HIT SUCCESSFULLY")

            // console.log("API REJECTION HIT SUCCESSFULLY")
            // eventemitter to send postId to the parent so that it can be removed from the list temporarily
            this.messageEvent.emit(this.postIdReceived)

          },
          () => {
            this.timelineFetchStatus = 'error'
          },

        )
      } else {
        this.type = 'REJECT'
      }

      // console.log('This DATA RECEIVED IN NEW WAY IS' + this.reasonReceivedFromDialog)
    })
    // this.deletePost()
  }
  // admin accepting flagged post

  openAdminAcceptDialog(): void {
    const dialogRefxv = this.dialog.open(DialogBoxAdminAcceptComponent)

    dialogRefxv.afterClosed().subscribe(result => {
      // console.log('The dialog was closed')
      if (result === true) {
        //  console.log('COOL...............')
        this.adminReviveRequest.id = this.postIdReceived
        this.adminServ.revivePost(this.adminReviveRequest).subscribe(() => {
          this.acceptedFlaggedId.emit(this.postIdReceived)
        },                                                           () => { })
      }

    })

  }
  openAdminReviveDialog(): void {

    this.adminReviveRequest.id = this.postIdReceived
    const dialogRef = this.dialog.open(DialogBoxAdminComponent)

    dialogRef.afterClosed().subscribe(result => {
      //  console.log('The dialog was closed')
      this.reasonOfRevival = result
      //  console.log('The reason received FOR REVIVAL is' + this.reasonOfRevival)
      this.adminReviveRequest.reactivateReason = this.reasonOfRevival
      this.adminServ.revivePost(this.adminReviveRequest).subscribe(() => {
        this.revivedId.emit(this.postIdReceived)
      },                                                           () => { })

    })
  }
}
