import { AuthExpiryDateConfirmComponent } from '@ws/author/src/lib/modules/shared/components/auth-expiry-date-confirm/auth-expiry-date-confirm.component'
import { FlatTreeControl } from '@angular/cdk/tree'
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { FormGroup } from '@angular/forms'
import { MatDialog, MatSnackBar, MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material'
import { ActivatedRoute, Router } from '@angular/router'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NSApiRequest } from '@ws/author/src/lib/interface/apiRequest'
import {
  IAuthoringPagination,
  IFilterMenuNode,
  IMenuFlatNode,
} from '@ws/author/src/lib/interface/authored'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { CommentsDialogComponent } from '@ws/author/src/lib/modules/shared/components/comments-dialog/comments-dialog.component'
import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { ErrorParserComponent } from '@ws/author/src/lib/modules/shared/components/error-parser/error-parser.component'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { Subscription } from 'rxjs'
import { MyContentService } from '../../services/my-content.service'
import { map } from 'rxjs/operators'
import { REVIEW_ROLE, PUBLISH_ROLE, CREATE_ROLE } from '@ws/author/src/lib/constants/content-role'

@Component({
  selector: 'ws-auth-my-content',
  templateUrl: './my-content.component.html',
  styleUrls: ['./my-content.component.scss'],
})
export class MyContentComponent implements OnInit, OnDestroy {
  public sideNavBarOpened = false
  newDesign = true
  filterMenuTreeControl: FlatTreeControl<IMenuFlatNode>
  filterMenuTreeFlattener: any
  public cardContent!: any[]
  public filters: any[] = []
  public status = 'draft'
  public fetchError = false
  contentType: string[] = []
  complexityLevel: string[] = []
  unit: string[] = []
  finalFilters: any = []
  allLanguages: any[] = []
  searchLanguage = ''
  public pagination!: IAuthoringPagination
  userId!: string
  totalContent!: number
  showLoadMore!: boolean
  routerSubscription = <Subscription>{}
  queryFilter = ''
  ordinals: any
  isAdmin = false
  currentAction: 'author' | 'reviewer' | 'expiry' | 'deleted' = 'author'
  @ViewChild('searchInput', { static: false }) searchInputElem: ElementRef<any> = {} as ElementRef<
    any
  >

  // sideNavBarOpened = true
  panelOpenState = false
  allowReview = false
  allowAuthor = false
  allowRedo = false
  allowPublish = false
  allowExpiry = false
  allowRestore = false
  isNewDesign = false

  public filterMenuItems: any = []

  dataSource: any
  hasChild = (_: number, node: IMenuFlatNode) => node.expandable

  private _transformer = (node: IFilterMenuNode, level: number) => {
    return {
      expandable: !!node.content && node.content.length > 0,
      displayName: node.displayName,
      checked: node.checked,
      type: node.type,
      count: node.count,
      levels: level,
    }
  }

  constructor(
    private myContSvc: MyContentService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private loadService: LoaderService,
    private accessService: AccessControlService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authInitService: AuthInitService,
  ) {
    this.filterMenuTreeControl = new FlatTreeControl<IMenuFlatNode>(
      node => node.levels,
      node => node.expandable,
    )
    this.filterMenuTreeFlattener = new MatTreeFlattener(
      this._transformer,
      node => node.levels,
      node => node.expandable,
      node => node.content,
    )
    this.dataSource = new MatTreeFlatDataSource(
      this.filterMenuTreeControl,
      this.filterMenuTreeFlattener,
    )
    this.dataSource.data = this.filterMenuItems
    this.userId = this.accessService.userId
    this.isAdmin = this.accessService.hasRole(['admin', 'super-admin', 'content-admin', 'editor'])
  }

  ngOnDestroy() {
    if (this.routerSubscription.unsubscribe) {
      this.routerSubscription.unsubscribe()
    }
    this.loadService.changeLoad.next(false)
  }

  ngOnInit() {
    this.pagination = {
      offset: 0,
      limit: 24,
    }
    this.newDesign = this.accessService.authoringConfig.newDesign
    this.ordinals = this.authInitService.ordinals
    this.allLanguages = this.authInitService.ordinals.subTitles || []
    this.activatedRoute.queryParams.subscribe(params => {
      this.status = params.status
      this.setAction()
      this.fetchContent(false)
    })

    this.allowAuthor = this.canShow('author')
    this.allowRedo = this.accessService.authoringConfig.allowRedo
    this.allowRestore = this.accessService.authoringConfig.allowRestore
    this.allowExpiry = this.accessService.authoringConfig.allowExpiry
    this.allowReview = this.canShow('review') && this.accessService.authoringConfig.allowReview
    this.allowPublish = this.canShow('publish') && this.accessService.authoringConfig.allowPublish
  }

  fetchStatus() {
    switch (this.status) {
      case 'draft':
      case 'rejected':
        return ['Draft']
      case 'inreview':
        return ['InReview', 'Reviewed', 'QualityReview']
      case 'review':
        return ['InReview']
      case 'published':
      case 'expiry':
        return ['Live']
      case 'publish':
        return ['Reviewed']
      case 'processing':
        return ['Processing']
      case 'unpublished':
        return ['Unpublished']
      case 'deleted':
        return ['Deleted']
    }
    return ['Draft']
  }

  setAction() {
    switch (this.status) {
      case 'draft':
      case 'rejected':
      case 'inreview':
      case 'review':
      case 'published':
      case 'publish':
      case 'processing':
      case 'unpublished':
      case 'deleted':
        this.currentAction = 'author'
        break
      case 'expiry':
        this.currentAction = 'expiry'
        break
    }
  }

  fetchContent(loadMoreFlag: boolean, changeFilter = true) {
    const searchV6Data = this.myContSvc.getSearchBody(
      this.status,
      this.searchLanguage ? [this.searchLanguage] : [],
      loadMoreFlag ? this.pagination.offset : 0,
      this.queryFilter,
      this.isAdmin,
    )
    const requestData = {
      request: {
        locale: this.searchLanguage ? [this.searchLanguage] : [],
        query: this.queryFilter,
        filters: {
          status: this.fetchStatus(),
          creatorContacts: <string[]>[],
          trackContacts: <string[]>[],
          publisherDetails: <string[]>[],
          isMetaEditingDisabled: [false],
          isContentEditingDisabled: [false],
        },
        pageNo: loadMoreFlag ? this.pagination.offset : 0,
        sort: [{ lastUpdatedOn: 'desc' }],
        pageSize: this.pagination.limit,
        uuid: this.userId,
        rootOrg: this.accessService.rootOrg,
        // this is for Author Only
        isUserRecordEnabled: !this.isAdmin,
      },
    }
    if (this.finalFilters.length) {
      this.finalFilters.forEach((v: any) => {
        searchV6Data.filters.forEach((filter: any) => {
          filter.andFilters[0] = {
            ...filter.andFilters[0],
            [v.key]: v.value,
          }
        })
        requestData.request.filters = { ...requestData.request.filters, [v.key]: v.value }
      })
    }
    if (this.queryFilter) {
      delete requestData.request.sort
    }
    if (
      [
        'draft',
        'rejected',
        'inreview',
        'published',
        'unpublished',
        'processing',
        'deleted',
      ].indexOf(this.status) > -1 &&
      !this.isAdmin
    ) {
      requestData.request.filters.creatorContacts.push(this.userId)
    }
    if (this.status === 'review' && !this.isAdmin) {
      requestData.request.filters.trackContacts.push(this.userId)
    }
    if (this.status === 'publish' && !this.isAdmin) {
      requestData.request.filters.publisherDetails.push(this.userId)
    }

    this.loadService.changeLoad.next(true)
    const observable =
      this.status === 'expiry' || this.newDesign
        ? this.myContSvc.fetchFromSearchV6(searchV6Data, this.isAdmin).pipe(
          map((v: any) => {
            return {
              result: {
                response: v,
              },
            }
          }),
        )
        : this.myContSvc.fetchContent(requestData)
    this.loadService.changeLoad.next(true)
    observable.subscribe(
      data => {
        this.loadService.changeLoad.next(false)
        if (changeFilter) {
          this.filterMenuItems =
            data && data.result && data.result.response && data.result.response.filters
              ? data.result.response.filters
              : this.filterMenuItems
          this.dataSource.data = this.filterMenuItems
        }
        this.cardContent =
          loadMoreFlag && !this.queryFilter
            ? (this.cardContent || []).concat(
              data && data.result && data.result.response ? data.result.response.result : [],
            )
            : data && data.result.response
              ? data.result.response.result
              : []
        this.totalContent = data && data.result.response ? data.result.response.totalHits : 0
        this.showLoadMore =
          this.pagination.offset * this.pagination.limit + this.pagination.limit < this.totalContent
            ? true
            : false
        this.fetchError = false
      },
      () => {
        this.fetchError = true
        this.cardContent = []
        this.showLoadMore = false
        this.loadService.changeLoad.next(false)
      },
    )
  }

  search() {
    if (this.searchInputElem.nativeElement) {
      this.queryFilter = this.searchInputElem.nativeElement.value.trim()
    }
    this.fetchContent(false, false)
  }

  filterApplyEvent(node: any) {
    this.pagination.offset = 0
    this.sideNavBarOpened = false
    const filterIndex = this.filters.findIndex(v => v.displayName === node.displayName)
    const filterMenuItemsIndex = this.filterMenuItems.findIndex((obj: any) =>
      obj.content.some((val: any) => val.type === node.type),
    )
    const ind = this.finalFilters.indexOf(this.filterMenuItems[filterMenuItemsIndex].type)
    if (filterIndex === -1 && node.checked) {
      this.filters.push(node)
      this.filterMenuItems[filterMenuItemsIndex].content.find(
        (v: any) => v.displayName === node.displayName,
      ).checked = true

      if (ind === -1) {
        this.finalFilters.push({
          key: this.filterMenuItems[filterMenuItemsIndex].type,
          value: [node.type],
        })
      } else {
        this.finalFilters[ind].value.push(node.type)
      }
    } else {
      this.filterMenuItems[filterMenuItemsIndex].content.find(
        (v: any) => v.displayName === node.displayName,
      ).checked = false
      this.filters.splice(filterIndex, 1)
      this.finalFilters.splice(ind, 1)
    }
    this.dataSource.data = this.filterMenuItems
    this.fetchContent(false, false)
  }

  deleteContent(request: NSContent.IContentMeta) {
    this.loadService.changeLoad.next(true)
    this.myContSvc
      .deleteContent(request.identifier, request.contentType === 'Knowledge Board')
      .subscribe(
        () => {
          this.loadService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.SUCCESS,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
          this.cardContent = (this.cardContent || []).filter(
            v => v.identifier !== request.identifier,
          )
        },
        error => {
          if (error.status === 409) {
            this.dialog.open(ErrorParserComponent, {
              width: '80vw',
              height: '90vh',
              data: {
                errorFromBackendData: error.error,
              },
            })
          }
          this.loadService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.CONTENT_FAIL,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
      )
  }

  restoreContent(request: NSContent.IContentMeta) {
    this.loadService.changeLoad.next(true)
    this.myContSvc.restoreContent(request.identifier).subscribe(
      () => {
        this.loadService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        this.cardContent = (this.cardContent || []).filter(v => v.identifier !== request.identifier)
      },
      error => {
        if (error.status === 409) {
          this.dialog.open(ErrorParserComponent, {
            width: '80vw',
            height: '90vh',
            data: {
              errorFromBackendData: error.error,
            },
          })
        }
        this.loadService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.CONTENT_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      },
    )
  }

  createContent(request: NSContent.IContentMeta) {
    this.loadService.changeLoad.next(true)
    this.myContSvc.createInAnotherLanguage(request.identifier, request.locale).subscribe(
      (id: string) => {
        this.loadService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.CONTENT_CREATE_SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        this.router.navigateByUrl(`/author/editor/${id}`)
      },
      error => {
        if (error.status === 409) {
          this.dialog.open(ErrorParserComponent, {
            width: '750px',
            height: '450px',
            data: {
              errorFromBackendData: error.error,
            },
          })
        }
        this.loadService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.CONTENT_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      },
    )
  }

  clearAllFilters() {
    this.finalFilters = []
    this.searchInputElem.nativeElement.value = ''
    this.queryFilter = ''
    this.filterMenuItems.map((val: any) => val.content.map((v: any) => (v.checked = false)))
    this.dataSource.data = this.filterMenuItems
    this.filters = []
    this.fetchContent(false)
  }

  loadMore() {
    this.pagination.offset += 1
    this.fetchContent(true, false)
  }

  confirmAction(content: any) {
    let message = ''
    if (content.type === 'delete') {
      message = 'delete'
    } else if (content.type === 'restoreDeleted') {
      message = 'restoreDeleted'
    } else if (content.type === 'unpublish') {
      message = 'unpublish'
    } else if (content.type === 'moveToDraft' || content.type === 'moveToInReview') {
      if (content.data.mimeType.indexOf('collection') >= 0) {
        message = 'retrieveParent'
      } else {
        message = 'retrieveChild'
      }
    } else {
      this.forwardBackward(content)
      return
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '600px',
      height: '200px',
      data: message,
    })

    dialogRef.afterClosed().subscribe((confirm: any) => {
      if (confirm) {
        if (content.type === 'delete') {
          this.deleteContent(content.data)
        } else if (content.type === 'restoreDeleted') {
          this.restoreContent(content.data)
        } else if (
          content.type === 'unpublish' ||
          (content.type === 'moveToDraft' && content.data.status === 'Unpublished')
        ) {
          this.unPublishOrDraft(content.data)
        } else {
          this.forwardBackward(content)
        }
      }
    })
  }

  unPublishOrDraft(request: NSContent.IContentMeta) {
    this.loadService.changeLoad.next(true)
    this.myContSvc.upPublishOrDraft(request.identifier, request.status !== 'Unpublished').subscribe(
      () => {
        this.loadService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        this.cardContent = (this.cardContent || []).filter(v => v.identifier !== request.identifier)
      },
      error => {
        if (error.status === 409) {
          this.dialog.open(ErrorParserComponent, {
            width: '750px',
            height: '450px',
            data: {
              errorFromBackendData: error.error,
            },
          })
        }
        this.loadService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.CONTENT_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      },
    )
  }

  forwardBackward(content: any) {
    const dialogRef = this.dialog.open(CommentsDialogComponent, {
      width: '750px',
      height: '450px',
      data: { ...content.data, status: 'Draft' },
    })

    dialogRef.afterClosed().subscribe((commentsForm: FormGroup) => {
      if (commentsForm) {
        this.finalCall(commentsForm, content)
      }
    })
  }

  finalCall(commentsForm: FormGroup, content: any) {
    if (commentsForm) {
      let operationValue: any
      switch (content.type) {
        case 'moveToDraft':
          operationValue = 0
          break
        case 'moveToInReview':
          operationValue = -1
          break
      }
      const body: NSApiRequest.IForwardBackwardActionGeneral = {
        comment: commentsForm.controls.comments.value,
        operation: operationValue,
      }
      this.loadService.changeLoad.next(true)
      this.myContSvc.forwardBackward(body, content.data.identifier, content.data.status).subscribe(
        () => {
          this.loadService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.SUCCESS,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
          this.cardContent = (this.cardContent || []).filter(
            v => v.identifier !== content.data.identifier,
          )
        },
        error => {
          if (error.status === 409) {
            this.dialog.open(ErrorParserComponent, {
              width: '80vw',
              height: '90vh',
              data: {
                errorFromBackendData: error.error,
              },
            })
          }
          this.loadService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.CONTENT_FAIL,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
      )
    }
  }

  action(event: { data: NSContent.IContentMeta; type: string }) {
    switch (event.type) {
      case 'create':
        this.createContent(event.data)
        break

      case 'review':
      case 'publish':
      case 'edit':
        this.router.navigateByUrl(`/author/editor/${event.data.identifier}`)
        break
      case 'remove':
        this.cardContent = (this.cardContent || []).filter(
          v => v.identifier !== event.data.identifier,
        )
        break
      case 'moveToInReview':
      case 'moveToDraft':
      case 'delete':
      case 'unpublish':
      case 'restoreDeleted':
        this.confirmAction(event)
        break
      case 'expiryExtend':
        this.actionOnExpiry(event.data)
    }
  }

  actionOnExpiry(content: NSContent.IContentMeta) {
    const dialogRef = this.dialog.open(AuthExpiryDateConfirmComponent, {
      width: '750px',
      height: '300px',
      data: content,
    })

    dialogRef.afterClosed().subscribe((userAction?: { isExtend: boolean; expiryDate?: string }) => {
      if (userAction) {
        this.cardContent = (this.cardContent || []).filter(v => v.identifier !== content.identifier)
      }
    })
  }

  setCurrentLanguage(lang: string) {
    this.searchLanguage = lang
  }
  canShow(role: string): boolean {
    switch (role) {
      case 'review':
        return this.accessService.hasRole(REVIEW_ROLE)
      case 'publish':
        return this.accessService.hasRole(PUBLISH_ROLE)
      case 'author':
        return this.accessService.hasRole(CREATE_ROLE)
      default:
        return false
    }
  }
}
