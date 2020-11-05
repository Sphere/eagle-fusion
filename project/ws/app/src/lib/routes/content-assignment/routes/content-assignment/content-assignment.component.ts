import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { MatDialog, MatDialogConfig, MatSnackBar } from '@angular/material'
import { MatPaginator, PageEvent } from '@angular/material/paginator'
import { ActivatedRoute, Router } from '@angular/router'
import { ContentAssignService, NsContent } from '@ws-widget/collection'
import { ConfigurationsService, TFetchStatus, ValueService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import {
  IContentAssignModel,
} from '../../../../../../../../../library/ws-widget/collection/src/lib/content-assign/content-assign.model'
import { IFilterUnitResponse } from '../../../search/models/search.model'
import { DialogAssignComponent } from '../../components/dialog-assign/dialog-assign.component'
import {
  UserFilterDisplayComponent,
} from '../../components/user-filter-display/user-filter-display.component'
@Component({
  selector: 'ws-app-content-assignment',
  templateUrl: './content-assignment.component.html',
  styleUrls: ['./content-assignment.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true },
  }],
})

export class ContentAssignmentComponent implements OnInit {

  @ViewChild(UserFilterDisplayComponent, { static: false })
  appFilterDisplay: UserFilterDisplayComponent | null = null

  @ViewChild('selectContent', { static: true })
  selectContentMessage!: ElementRef<any>

  @ViewChild('selectFilters', { static: true })
  selectFilterMessage!: ElementRef<any>

  @ViewChild('selectUsers', { static: true })
  selectUserMessage!: ElementRef<any>

  @ViewChild('getAdminLevelError', { static: true })
  adminLevelMessage!: ElementRef<any>

  @ViewChild('searchUsersError', { static: true })
  userSearchMessage!: ElementRef<any>

  @ViewChild('contentAssignError', { static: true })
  contentAssignErrorMessage!: ElementRef<any>

  @ViewChild('contentAssignSuccess', { static: true })
  contentAssignSuccessMessage!: ElementRef<any>

  @ViewChild('paginator', { static: true }) paginator!: MatPaginator

  fetchUserStatus: TFetchStatus = 'none'

  selectedContentIds: Set<string> = new Set()
  chipNamesHash: { [id: string]: string } = {}

  selectedUserIds: Set<string> = new Set()
  selectedUserIdList: string[] = []
  userRoles: Set<string> = new Set()

  isLtMedium$ = this.valueSvc.isLtMedium$
  screenSizeIsLtMedium = false
  defaultSideNavBarOpenedSubscription: Subscription | null = null
  sideNavBarOpened = true
  filtersResetAble = false

  userAdminLevel = ''
  userId = ''
  orgs: string[] = []
  rootOrg = ''
  userType = ''

  length = 0
  pageSize = 10
  pageIndex = 0
  query = ''

  // MatPaginator Output
  pageEvent!: PageEvent

  adminLevels: string[] = [
    'cbg',
    'market',
    'market_group',
    'market_sub_group',
    'country',
    'region',
    'guild_group',
    'classification',
    'remote',
    'zone',
    'dealer_group_code',
    'dealer_code',
    'job_title',
    'experience_level',
  ]

  assignDisabled = false
  manualSelectionMode = false

  searchReqBody: any

  filtersResponse!: IFilterUnitResponse[]

  userData: any[] = []
  requiredAggs: string[] = []

  allReportees = false
  directReportees = true

  isMandatory = true

  userFilterLevel = ''

  sortParameter = ''
  sortOrder = 'asc'

  constructor(
    public router: Router,
    public dialog: MatDialog,
    private valueSvc: ValueService,
    private contentAssignSvc: ContentAssignService,
    private configSvc: ConfigurationsService,
    private snackbar: MatSnackBar,
    public route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId
      if (this.configSvc.org) {
        this.orgs = this.configSvc.org
      }
      if (this.configSvc.rootOrg) {
        this.rootOrg = this.configSvc.rootOrg
        if (this.rootOrg === 'RootOrg') {
          this.isMandatory = true
        }
      }
    }
    setTimeout(() => {
      this.userType = this.route.snapshot.queryParams.userType
      this.userAdminLevel = this.route.snapshot.queryParams.adminLevel
      if (this.userType === 'manager') {
        this.directReportees = true
        this.allReportees = false
      } else if (this.userType === 'admin') {
        this.directReportees = false
        this.allReportees = false
      }
    },         60)
    this.defaultSideNavBarOpenedSubscription = this.isLtMedium$.subscribe((isLtMedium: boolean) => {
      this.screenSizeIsLtMedium = isLtMedium
      this.sideNavBarOpened = !isLtMedium
    })
  }

  selectAllUsers(checked: boolean) {
    this.manualSelectionMode = !checked
    if (this.searchReqBody['query'].length > 0) {
      this.searchUsers()
    }
    this.searchReqBody['query'] = ''
    this.query = ''
    this.selectedUserIds.clear()
  }

  contentChanged(content: Partial<NsContent.IContentMinimal>, checked: boolean) {
    if (content && content.identifier) {
      if (checked) {
        this.selectedContentIds.add(content.identifier)
      } else {
        this.selectedContentIds.delete(content.identifier)
      }
    }
  }

  changeUserSelectionMode(reporteeType: string) {
    this.selectedUserIds.clear()
    this.selectedUserIdList = []
    if (reporteeType === 'allReportees') {
      this.allReportees = true
      this.directReportees = false
    } else if (reporteeType === 'directReportees') {
      this.allReportees = false
      this.directReportees = true
    }
    this.searchReqBody.pageNo = 0
    this.searchReqBody.filters['all_reportees'] = this.allReportees
    this.searchReqBody.filters['direct_reportees'] = this.directReportees
    this.searchUsers()
  }

  userChanged(wid: any, checked: boolean) {
    this.selectedUserIdList = [...this.selectedUserIds]
    if (wid) {
      if (checked) {
        this.selectedUserIds.add(wid)
      } else {
        this.selectedUserIds.delete(wid)
      }
    }
  }

  handlePage(event: PageEvent) {
    this.applyPageNumber(event.pageIndex)
    return event
  }

  sortAscOrDesc(value: string) {
    if (this.searchReqBody['sort'][0]) {
      this.sortOrder = value
      const key = Object.keys(this.searchReqBody['sort'][0])[0]
      this.searchReqBody['sort'][0][key] = this.sortOrder
      this.searchUsers()
    }
  }

  handleSearchQuery() {
    this.searchReqBody['query'] = this.query
    this.manualSelectionMode = true
    this.searchUsers()
  }

  sortBy(key: string) {
    this.searchReqBody['sort'] = [{}]
    this.searchReqBody['sort'][0][key] = this.sortOrder
    this.searchUsers()
  }

  searchUsers() {
    if (this.checkContentSelection()) {
      this.fetchUserStatus = 'fetching'
      if (this.userType === 'admin') {
        this.requiredAggs = this.adminLevels.filter(level => {
          return this.adminLevels.indexOf(level) >= this.adminLevels.indexOf(this.userAdminLevel)
        })
      } else {
        this.requiredAggs = this.adminLevels
      }

      if (!this.searchReqBody) {
        this.searchReqBody = {
          pageNo: 0,
          pageSize: this.pageSize,
          orgs: this.orgs,
          userId: this.userId,
          filters: {
            all_reportees: this.allReportees,
            direct_reportees: this.directReportees,
          },
          requiredSources: ['full_name', 'wid', 'job_title', 'dealer_name_branch_code', 'source_id', 'email'],
          query: '',
          sort: [{
            full_name: 'asc',
          }],
        }
        this.searchReqBody.requiredAggs = this.requiredAggs
      } else if (!this.searchReqBody.requiredAggs) {
        this.searchReqBody.requiredAggs = this.requiredAggs
      }
      this.contentAssignSvc.searchUsers(this.searchReqBody).subscribe((response: any) => {
        this.userData = response.result
        this.length = response.totalHits
        this.filtersResponse = response.filters
        this.fetchUserStatus = 'done'

      },                                                              err => {
        if (err) {
          this.fetchUserStatus = 'none'
          return
        }

      })
    } else {
      this.snackbar.open(this.selectContentMessage.nativeElement.value)
      return
    }

  }

  checkContentSelection() {
    if ([...this.selectedContentIds].length > 0) {
      return true
    }
    return false
  }

  checkUserSelection() {
    if ((this.manualSelectionMode && this.selectedUserIds.size) || !this.manualSelectionMode) {
      return true
    }
    return false
  }

  checkFilterSelection() {
    const filtersChecked = this.filtersResponse.map(value => {
      return value.checked
    })
    if (filtersChecked.includes(true)) {
      return true
    }
    return false
  }

  applyFilter(filters: { [key: string]: string[] }) {
    if (!this.searchReqBody) {
      this.searchReqBody = {
        pageNo: 0,
        pageSize: this.pageSize,
        orgs: this.orgs,
        userId: this.userId,
        filters: {
          ...filters,
          all_reportees: this.allReportees,
          direct_reportees: this.directReportees,
        },
        requiredSources: ['full_name', 'wid', 'job_title', 'dealer_name_branch_code', 'source_id', 'email'],
        query: '',
        sort: [{
          full_name: 'asc',
        }],
      }

    } else {
      this.searchReqBody.pageNo = 0
      this.searchReqBody.filters = filters
    }
    this.searchUsers()

  }

  applyPageSize() {
    this.searchReqBody.pageSize = this.pageSize
    this.searchUsers()
  }

  applyPageNumber(pageNumber: number) {
    this.searchReqBody.pageNo = pageNumber
    this.searchUsers()
  }

  closeFilter(value: boolean) {
    this.sideNavBarOpened = value
  }

  assign() {
    if (this.checkUserSelection()) {
      const dialogConfig = new MatDialogConfig()

      dialogConfig.maxWidth = '500px'
      dialogConfig.data = {
        isMandatory: this.isMandatory,
        contentsCount: this.selectedContentIds.size,
        usersCount: this.manualSelectionMode ? this.selectedUserIds.size : this.length,
      }
      const dialogRef = this.dialog.open(DialogAssignComponent, dialogConfig)

      dialogRef.afterClosed().subscribe(response => {
        if (response) {
          this.isMandatory = response.isMandatory

          if (response.confirm) {
            this.assignDisabled = true
            const reqBody: IContentAssignModel = [...this.selectedUserIds].length > 0 ? {
              contentIds: [...this.selectedContentIds],
              userCriteria: {
                ...this.searchReqBody.filters,
                wid: [...this.selectedUserIds],
              },
              assignedBy: this.userId,
              assignmentType: this.userType,
              isMandatory: this.isMandatory,
            } : {
                contentIds: [...this.selectedContentIds],
                userCriteria: {
                  ...this.searchReqBody.filters,
                  all_reportees: this.allReportees,
                },
                assignedBy: this.userId,
                assignmentType: this.userType,
                isMandatory: this.isMandatory,
              }
            this.contentAssignSvc.assignContent(reqBody).subscribe(
              () => {
                this.snackbar.open(this.contentAssignSuccessMessage.nativeElement.value)
                if (this.userType === 'manager') {
                  this.router.navigateByUrl('/app/content-assignment/view')
                } else if (this.userType === 'admin') {
                  this.router.navigateByUrl('/admin/tenant/content-assignment/view')
                }

              },
              error => {
                if (error) {
                  this.assignDisabled = false
                  this.snackbar.open(error.error.errors[0].message)
                  return
                }

              })
          }
        }
      })
    } else {
      this.snackbar.open(this.selectUserMessage.nativeElement.value)
      return
    }

  }

}
