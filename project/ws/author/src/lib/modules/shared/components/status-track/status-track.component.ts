import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { AccessControlService } from './../../services/access-control.service'
import { WorkFlowService } from '@ws/author/src/lib/services/work-flow.service'
import { ISearchContent } from '@ws/author/src/lib/interface/search'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { Component, Input, OnInit, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'

interface IWorkFlowLog {
  name: string
  date: Date
  action: string
  owner: string | null
  comment: string
}

interface IWorkFlowStepper {
  name: string
  date: Date
  processName: string
  owner: string
  comment: string
  isCompleted: boolean
  isActive: boolean
}

@Component({
  selector: 'ws-auth-status-track',
  templateUrl: './status-track.component.html',
  styleUrls: ['./status-track.component.scss'],
})
export class StatusTrackComponent implements OnInit {
  @Input() content!: NSContent.IContentMeta | ISearchContent
  @Input() isDialog = true
  workFlow: IWorkFlowStepper[] = []
  currentStage = 0
  workFlowLog: IWorkFlowLog[] = []
  history: NSContent.IComments[] = []
  isClient1 = false
  showModal = false
  constructor(
    private accessSvc: AccessControlService,
    private initService: AuthInitService,
    public dialogRef: MatDialogRef<StatusTrackComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NSContent.IContentMeta | ISearchContent,
    private workFlowService: WorkFlowService,
  ) { }

  ngOnInit() {
    this.isClient1 = this.accessSvc.rootOrg.toLowerCase() === 'client1'
    if (this.data) {
      this.content = this.data
    }
    if (this.content.comments && this.content.comments.length) {
      this.history = this.content.comments.reverse()
    }
    this.history
      .filter(v => this.isActionLoggable(v.action))
      .forEach(v => {
        const action = (v.action || '').toLowerCase().includes('approved')
          ? 'approved'
          : (v.action || '').toLowerCase().includes('rejected')
            ? 'rejected'
            : v.action
        const log = {
          action,
          name: v.name,
          date: this.accessSvc.convertToISODate(v.date),
          owner: this.getOwnerName(v.action),
          comment: v.comment,
        }
        this.workFlowLog.push(log)
      })
    const systemFlow = this.workFlowService.getWorkFlow(this.content)
    this.currentStage = systemFlow.indexOf(this.content.status)
    if (this.currentStage > -1) {
      systemFlow
        .filter(v => v !== 'Processing')
        .forEach(v => {
          const index = systemFlow.indexOf(v)
          let acceptedActions: string[] = []
          this.initService.ownerDetails.forEach(detail => {
            if (detail.status.includes(v)) {
              acceptedActions = detail.relatedActions
            }
          })
          const step = {
            name: '',
            date: undefined as any,
            processName: v,
            owner: v !== 'Live' ? this.getActionMembers(v) : '',
            comment: '',
            isCompleted: index < this.currentStage,
            isActive: index === this.currentStage,
          }
          if (
            index < this.currentStage &&
            v !== 'Live' &&
            this.content.comments &&
            this.content.comments.length
          ) {
            for (let i = this.content.comments.length - 1; i > -1; i -= 1) {
              if (acceptedActions.includes(this.content.comments[i].action)) {
                step.name = this.content.comments[i].name
                step.comment = this.content.comments[i].comment
                step.date = this.accessSvc.convertToISODate(this.content.comments[i].date)
                break
              }
            }
          }
          if (this.content.status === 'Processing' && v === 'Live') {
            step.isActive = true
          }
          if (this.content.status === 'Live' && v === 'Live') {
            step.isCompleted = true
            step.isActive = false
          }
          this.workFlow.push(step)
        })
    }
  }

  getOwnerName(action: string): string {
    let owner = ''
    if (action) {
      this.initService.ownerDetails.forEach(v => {
        if (v.relatedActions.includes(action)) {
          owner = v.name
        }
      })
    }
    return owner
  }

  getActionMembers(status: string) {
    const meta = this.workFlowService.getOwner(status)
    if (meta) {
      return ((this.content as any)[meta] || []).map((v: { name: string }) => v.name).toString()
    }
    return ''
  }

  isActionLoggable(action: string): boolean {
    let isPresent = true
    if (action) {
      isPresent = false
      this.initService.ownerDetails.forEach(v => {
        if (v.relatedActions.includes(action)) {
          isPresent = true
        }
      })
    }
    return isPresent
  }
}
