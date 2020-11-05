import { animate, state, style, transition, trigger } from '@angular/animations'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { ActivatedRoute, Router } from '@angular/router'
import {
  ContentAssignService,
} from '../../../../../../../../../library/ws-widget/collection/src/public-api'
import {
  ConfigurationsService,
  NsPage,
  TFetchStatus,
} from '../../../../../../../../../library/ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-app-assignment-details',
  templateUrl: './assignment-details.component.html',
  styleUrls: ['./assignment-details.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class AssignmentDetailsComponent implements OnInit {

  @ViewChild('detailsFetchError', { static: true })
  assignmentDetailsFetchError!: ElementRef<any>

  columnsToDisplay = ['assignment_id', 'assigned_on', 'assignedUserCount', 'percentageProcessingCompleted']
  expandedElement: any | null
  dataSource: any
  fetchDetailStatus!: TFetchStatus
  userType = ''
  assignmentUrl = ''
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  constructor(
    private contentAssignSvc: ContentAssignService,
    private snackbar: MatSnackBar,
    public router: Router,
    public configSvc: ConfigurationsService,
    public route: ActivatedRoute
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.userType = this.route.snapshot.queryParams.userType
      if (this.userType === 'admin') {
        this.assignmentUrl = '/admin/tenant/content-assignment/assign'
      } else if (this.userType === 'manager') {
        this.assignmentUrl = '/app/content-assignment/assign'
      }
      this.getAssignments()
    },         10)
  }

  getAssignments() {
    this.fetchDetailStatus = 'fetching'
    this.contentAssignSvc.getAssignments(this.userType).subscribe(
      (data: any) => {
        if (data['content-assignments'].length > 0) {
          this.dataSource = data['content-assignments']
          this.fetchDetailStatus = 'done'
        } else {
          this.fetchDetailStatus = 'none'
        }

      },
      err => {
        if (err) {
          this.fetchDetailStatus = 'error'
          this.snackbar.open(this.assignmentDetailsFetchError.nativeElement.value)
        }
      })
  }
}
