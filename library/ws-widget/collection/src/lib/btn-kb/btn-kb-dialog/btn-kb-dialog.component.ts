import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core'
import { NsContent } from '../../_services/widget-content.model'
import { MatListOption, MAT_DIALOG_DATA, MatSnackBar, MatDialogRef, MatDialog } from '@angular/material'
import { TFetchStatus, ConfigurationsService } from '../../../../../utils/src/public-api'
import { BtnKbService } from '../btn-kb.service'
import { Router } from '@angular/router'
import { BtnKbConfirmComponent } from '../btn-kb-confirm/btn-kb-confirm.component'

@Component({
  selector: 'ws-widget-btn-kb-dialog',
  templateUrl: './btn-kb-dialog.component.html',
  styleUrls: ['./btn-kb-dialog.component.scss'],
})
export class BtnKbDialogComponent implements OnInit {
  @ViewChild('contentUpdated', { static: true }) contentUpdatedMessage!: ElementRef<any>
  @ViewChild('contentNotUpdated', { static: true }) contentNotUpdatedMessage!: ElementRef<any>

  inProgress: TFetchStatus = 'none'
  selectedBoards = new Set<string>()
  changedBoards = new Set<string>()
  postSelectedBoards = new Set<string>()
  reason = ''
  userId = ''
  contentId = ''
  contentName = ''
  userName = ''
  fetchKbs: TFetchStatus = 'none'
  knowledgeBoards: NsContent.IContent[] | null | any[] = null
  constructor(
    private matDialog: MatDialog,
    private dialog: MatDialogRef<BtnKbDialogComponent>,
    private snackbar: MatSnackBar,
    private configSvc: ConfigurationsService,
    private kbSvc: BtnKbService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  redirectToCreateKb() {
    this.dialog.close()
    this.router.navigateByUrl('/author/create')
  }

  ngOnInit() {
    // console.log("DATA: ", this.data)
    this.contentId = this.data.contentId
    this.contentName = this.data.name
    this.fetchKbs = 'fetching'
    if (this.configSvc.userProfile
      && this.configSvc.userProfile.userId
      && this.configSvc.userProfile.userName
      && this.configSvc.rootOrg
    ) {
      this.userId = this.configSvc.userProfile.userId
      this.userName = this.configSvc.userProfile.userName
    }
    this.kbSvc.getMyKnowledgeBoards().subscribe(response => {
      this.fetchKbs = 'done'
      this.knowledgeBoards = response.result
      this.knowledgeBoards.forEach(board => {
        if (board.children.map((content: { identifier: any }) => content.identifier).includes(this.contentId)) {
          this.selectedBoards.add(board.identifier)
        }
      })
      this.knowledgeBoards.forEach(board => {
        const sections = new Set<string>()
        board.sections = []
        board.selectedSection = []
        board.newSelectedSection = ''
        board.children.forEach((child: any) => {
          if (child.identifier === this.contentId) {
            if (child.childrenClassifiers.length) {
              child.childrenClassifiers.forEach((childClassifier: any) => {
                if (!board.selectedSection) {
                  board.selectedSection = childClassifier
                }
              })
            } else {
              board.selectedSection = 'Default'
            }
          }
          child.childrenClassifiers.forEach((childClassifier: string) => {
            if (!sections.has(childClassifier)) {
              sections.add(childClassifier)
              board.sections.push(childClassifier)
            }
          })
        })
      })
    }

    )
  }

  selectionChange(kbId: string, checked: boolean) {
    if (this.knowledgeBoards) {
      const board = this.knowledgeBoards.find(b => b.identifier === kbId)
      if (board) {
        this.changedBoards.add(board.identifier)
        let children: any = board.children.map((child: any) => ({
          ...child,
        }))
        if (checked) {
          this.postSelectedBoards.add(board.identifier)
        } else {
          this.postSelectedBoards.delete(board.identifier)
          children = children.filter((child: any) => child.identifier !== this.contentId)
          board.children = children
        }
      }
    }
  }

  addContentToKb(options: MatListOption[]) {
    this.inProgress = 'fetching'
    options.forEach((option: MatListOption) => {
      if (this.knowledgeBoards) {
        const board = this.knowledgeBoards.find(b => b.identifier === option.value)
        if (board && this.postSelectedBoards.has(board.identifier)) {
          if (option.selected) {
            let newChildrenClassifier = board.selectedSection
            if (board.newSelectedSection.length) {
              newChildrenClassifier = board.newSelectedSection
            }

            const req = {
              identifier: board.identifier,
              children: [{ identifier: this.contentId, reason: this.reason, childrenClassifiers: [newChildrenClassifier] }],
              actor: this.userId,
              actorName: this.userName,
            }
            this.kbSvc.modifyKBV2(req, 'add').subscribe(
              _ => {
                this.inProgress = 'done'
                board.message = 'success'
                this.postSelectedBoards.clear()
                this.selectedBoards.add(board.identifier)
                this.snackbar.open(this.contentUpdatedMessage.nativeElement.value)
                // this.dialog.close()
              },
              _ => {
                this.inProgress = 'error'
                board.message = 'failure'
                this.snackbar.open(this.contentNotUpdatedMessage.nativeElement.value)
              },
            )
          }
        }

      } else {
        this.inProgress = 'done'
      }
    })
  }

  doneChanges() {
    if (this.postSelectedBoards.size > 0) {
      const dialogRef = this.matDialog.open(BtnKbConfirmComponent)
      dialogRef.afterClosed().subscribe(result => {
        if (!result) {
          this.dialog.close()
        }
      })
    } else {
      this.dialog.close()
    }
  }
}
