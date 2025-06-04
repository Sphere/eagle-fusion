import { DeleteDialogComponent } from '@ws/author/src/lib/modules/shared/components/delete-dialog/delete-dialog.component'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { IActionButton, IActionButtonConfig } from '@ws/author/src/lib/interface/action-button'
import { NSApiRequest } from '@ws/author/src/lib/interface/apiRequest'
import { IAuthSteps } from '@ws/author/src/lib/interface/auth-stepper'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { CommentsDialogComponent } from '@ws/author/src/lib/modules/shared/components/comments-dialog/comments-dialog.component'
import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { ErrorParserComponent } from '@ws/author/src/lib/modules/shared/components/error-parser/error-parser.component'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
import { EditorService } from '@ws/author/src/lib/routing/modules/editor/services/editor.service'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { of, Subscription } from 'rxjs'
import { map, mergeMap, tap, catchError } from 'rxjs/operators'
import { IContentNode, IContentTreeNode } from '../../interface/icontent-tree'
import { CollectionResolverService } from './../../services/resolver.service'
import { CollectionStoreService } from './../../services/store.service'
import { VIEWER_ROUTE_FROM_MIME } from '@ws-widget/collection'
import { NotificationService } from '@ws/author/src/lib/services/notification.service'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout'
import { HeaderServiceService } from './../../../../../../../../../../../../../src/app/services/header-service.service'
import { RootService } from 'src/app/component/root/root.service'
import { FlatTreeControl } from '@angular/cdk/typings/tree'

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ws-author-course-collection',
  templateUrl: './course-collection.component.html',
  styleUrls: ['./course-collection.component.scss'],
  providers: [CollectionStoreService, CollectionResolverService],
})
export class CourseCollectionComponent implements OnInit, OnDestroy {
  contents: NSContent.IContentMeta[] = []
  couseCreated = ''
  currentParentId!: string
  stepper: IAuthSteps[] = [
    { title: 'Choose Type', disabled: true },
    { title: 'Content', disabled: false },
    { title: 'Details', disabled: false },
  ]
  isSubmitPressed = false
  showLanguageBar = false
  actionButton: IActionButtonConfig | null = null
  currentStep = 1
  currentContent!: string
  activeContentSubscription: Subscription | null = null
  routerSubscription: Subscription | null = null
  isChanged = false
  previewIdentifier: string | null = null
  viewMode = 'meta'
  mimeTypeRoute = ''

  mediumScreen = false
  sideBarOpened = false
  mediumSizeBreakpoint$ = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small])
    .pipe(map((res: BreakpointState) => res.matches))
  mode$ = this.mediumSizeBreakpoint$.pipe(map(isMedium => (isMedium ? 'over' : 'side')))
  leftArrow = true
  showAddchapter = false
  createTopicForm: UntypedFormGroup | undefined
  reloadTOC = false
  public sideNavBarOpened = false
  callSaveFn!: boolean
  courseName: any
  parentNodeId!: number
  expandedNodes = new Set<number>()
  treeControl!: FlatTreeControl<IContentTreeNode>
  triggerQuizSave = false
  triggerUploadSave = false

  constructor(
    private contentService: EditorContentService,
    private activateRoute: ActivatedRoute,
    private storeService: CollectionStoreService,
    private resolverService: CollectionResolverService,
    private initService: AuthInitService,
    private loaderService: LoaderService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private editorService: EditorService,
    private router: Router,
    private notificationSvc: NotificationService,
    private accessControlSvc: AccessControlService,
    private breakpointObserver: BreakpointObserver,
    private fb: UntypedFormBuilder,
    private headerService: HeaderServiceService,
    private rootSvc: RootService,
  ) {
    this.callSaveFn = this.headerService.isSavePressed
    this.rootSvc.showNavbarDisplay$.next(false)
    this.headerService.headerSaveData.subscribe(data => {
      if (data) {
        this.save()
      }
    })
  }

  ngOnInit() {
    this.routerValuesCall()
    this.parentNodeId = this.storeService.currentParentNode
    // this.expandNodesById([this.parentNodeId])
    this.createTopicForm = this.fb.group({
      topicName: new UntypedFormControl('', [Validators.required]),
      topicDescription: new UntypedFormControl('', [Validators.required]),
    })

    this.stepper = this.initService.collectionConfig.stepper
    this.showLanguageBar = this.initService.collectionConfig.languageBar
    const actionButton: IActionButton[] = []
    this.initService.collectionConfig.actionButtons.buttons.forEach(action => {
      if (
        this.contentService.checkConditionV2(
          this.contentService.getOriginalMeta(this.currentParentId),
          action.conditions,
        )
      ) {
        actionButton.push({
          title: action.title,
          icon: action.icon,
          event: action.event,
          conditions: action.conditions,
        })
      }
    })
    this.actionButton = {
      enabled: this.initService.collectionConfig.actionButtons.enabled,
      buttons: actionButton,
    }
    this.mediumSizeBreakpoint$.subscribe(isLtMedium => {
      this.mediumScreen = isLtMedium
      this.sideBarOpened = !isLtMedium
    })
  }

  routerValuesCall() {
    this.contentService.changeActiveCont.subscribe(data => {
      this.currentContent = data

      if (this.contentService.getUpdatedMeta(data).contentType !== 'Resource') {
        this.viewMode = 'meta'
      }

    })

    if (this.activateRoute.parent && this.activateRoute.parent.parent) {
      this.routerSubscription = this.activateRoute.parent.parent.data.subscribe(data => {

        this.courseName = data.contents[0].content.name

        const contentDataMap = new Map<string, NSContent.IContentMeta>()

        data.contents.map((v: { content: NSContent.IContentMeta; data: any }) => {
          this.storeService.parentNode.push(v.content.identifier)
          this.resolverService.buildTreeAndMap(
            v.content,
            contentDataMap,
            this.storeService.flatNodeMap,
            this.storeService.uniqueIdMap,
            this.storeService.lexIdMap,
          )
        })
        contentDataMap.forEach(content => this.contentService.setOriginalMeta(content))
        const currentNode = (this.storeService.lexIdMap.get(this.currentContent) as number[])[0]

        this.currentParentId = this.currentContent
        this.storeService.treeStructureChange.next(
          this.storeService.flatNodeMap.get(currentNode) as IContentNode,
        )
        this.storeService.currentParentNode = currentNode
        this.storeService.currentSelectedNode = currentNode
        let newCreatedNode = 0
        const newCreatedLexid = this.editorService.newCreatedLexid
        if (newCreatedLexid) {
          newCreatedNode = (this.storeService.lexIdMap.get(newCreatedLexid) as number[])[0]
          this.storeService.selectedNodeChange.next(newCreatedNode)
        }

        if (data.contents[0] && data.contents[0].content && data.contents[0].content.children[0] &&
          data.contents[0].content.children[0].identifier) {
          this.subAction({ type: 'editContent', identifier: data.contents[0].content.children[0].identifier, nodeClicked: true })
          this.storeService.selectedNodeChange.next(data.contents[0].content.children[0].identifier)
        }

        // this.storeService.selectedNodeChange.subscribe(node => {
        //   if (node) {
        //     console.log('selected node', node)
        //     const getNodeId = (this.storeService.lexIdMap.get(node.toString()) as number[])[0]
        //     this.storeService.currentSelectedNode = getNodeId

        //     // this.contentService.currentContent = node.toString()

        //     // this.contentService.changeActiveCont.next(node.toString())

        //   }
        // })

      })

      this.activateRoute.parent.url.subscribe(data => {
        const urlParam = data[0].path
        if (urlParam === 'collection') {
          this.headerService.showCreatorHeader(this.courseName)
        }

      })
    }
  }

  expandNodesById(ids?: number[]) {
    const idSet = ids ? new Set(ids) : this.expandedNodes
    this.treeControl.dataNodes.forEach(node => {
      if (idSet.has(node.id)) {
        this.treeControl.expand(node)
        let parent = this.getParentNode(node)
        while (parent) {
          this.treeControl.expand(parent)
          parent = this.getParentNode(parent)
        }
      }
    })
  }

  getParentNode(node: IContentTreeNode): IContentTreeNode | null {
    const currentLevel = node.level

    if (currentLevel < 1) {
      return null
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1

    for (let i = startIndex; i >= 0; i = i - 1) {
      const currentNode = this.treeControl.dataNodes[i]

      if (currentNode.level < currentLevel) {
        return currentNode
      }
    }
    return null
  }

  ngOnDestroy() {
    this.loaderService.changeLoad.next(false)
    this.headerService.showCreatorHeader('showlogo')
    this.rootSvc.showNavbarDisplay$.next(true)
  }

  addChapterName() {
    // console.log('newchap', this.newChapterName)
  }

  async setContentType(param: string) {
    if (this.createTopicForm && this.createTopicForm.value) {

      this.couseCreated = param
      const asSibling = false

      const node = {
        id: this.storeService.currentParentNode,
        identifier: this.storeService.parentNode[0],
        editable: true,
        category: 'Course',
        childLoaded: true,
        expandable: true,
        level: 1,
      }

      const parentNode = node
      this.loaderService.changeLoad.next(true)

      const isDone = await this.storeService.createChildOrSibling(
        this.couseCreated,
        parentNode,
        asSibling ? node.id : undefined,
        'below',
        this.createTopicForm.value,
        param === 'web' ? 'link' : '',

      )

      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: isDone ? Notify.SUCCESS : Notify.FAIL,
        },
        duration: NOTIFICATION_TIME * 1000,

      })

      if (isDone) {

        const newCreatedLexid = this.editorService.newCreatedLexid
        const newCreatedNode = (this.storeService.lexIdMap.get(newCreatedLexid) as number[])[0]
        this.storeService.currentSelectedNode = newCreatedNode
        this.storeService.selectedNodeChange.next(newCreatedNode)
        this.currentContent = this.editorService.newCreatedLexid
      }
      this.showAddchapter = false
      this.loaderService.changeLoad.next(false)

      this.subAction({ type: 'editContent', identifier: this.editorService.newCreatedLexid, nodeClicked: false })
      this.createTopicForm.reset()
      this.save()
    }
  }

  sidenavClose() {
    setTimeout(() => (this.leftArrow = true), 500)
  }

  save(nextAction?: string) {

    const updatedContent = this.contentService.upDatedContent || {}
    if (this.viewMode === 'assessment') {
      this.triggerQuizSave = true
    } else
      if (this.viewMode === 'upload') {
        // TODO  console.log('viewmode', this.viewMode)
        this.triggerUploadSave = true
      }
    if (
      Object.keys(updatedContent).length ||
      Object.keys(this.storeService.changedHierarchy).length
    ) {
      this.isChanged = true
      this.loaderService.changeLoad.next(true)
      this.triggerSave().subscribe(
        () => {
          if (nextAction) {
            this.action(nextAction)
          }
          this.loaderService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.SAVE_SUCCESS,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
          // window.location.reload()
        },
        (error: any) => {
          if (error.status === 409) {
            const errorMap = new Map<string, NSContent.IContentMeta>()
            Object.keys(this.contentService.originalContent).forEach(v =>
              errorMap.set(v, this.contentService.originalContent[v]),
            )
            const dialog = this.dialog.open(ErrorParserComponent, {
              width: '80vw',
              height: '90vh',
              data: {
                errorFromBackendData: error.error,
                dataMapping: errorMap,
              },
            })
            dialog.afterClosed().subscribe(v => {
              if (v) {
                if (typeof v === 'string') {
                  this.storeService.selectedNodeChange.next(
                    (this.storeService.lexIdMap.get(v) as number[])[0],
                  )
                  this.contentService.changeActiveCont.next(v)
                } else {
                  this.storeService.selectedNodeChange.next(v)
                  this.contentService.changeActiveCont.next(
                    this.storeService.uniqueIdMap.get(v) as string,
                  )
                }
              }
            })
          }
          this.loaderService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.SAVE_FAIL,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
      )
    } else {
      if (nextAction) {
        this.action(nextAction)
      } else {
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.UP_TO_DATE,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      }
    }
  }

  get validationCheck(): boolean {
    const currentNodeId = this.storeService.lexIdMap.get(this.currentParentId) as number[]
    const returnValue = this.storeService.validationCheck(currentNodeId[0])
    if (returnValue) {
      const dialog = this.dialog.open(ErrorParserComponent, {
        width: '80vw',
        height: '90vh',
        data: {
          processErrorData: returnValue,
        },
      })
      dialog.afterClosed().subscribe(v => {
        if (v) {
          if (typeof v === 'string') {
            this.storeService.selectedNodeChange.next(
              (this.storeService.lexIdMap.get(v) as number[])[0],
            )
            this.contentService.changeActiveCont.next(v)
          } else {
            this.storeService.selectedNodeChange.next(v)
            this.contentService.changeActiveCont.next(
              this.storeService.uniqueIdMap.get(v) as string,
            )
          }
        }
      })
      return false
    }
    return true
  }

  takeAction() {
    this.isSubmitPressed = true
    const needSave = Object.keys(this.contentService.upDatedContent || {}).length
    if (!needSave && !this.isChanged) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.UP_TO_DATE,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }
    if (this.validationCheck) {
      const dialogRef = this.dialog.open(CommentsDialogComponent, {
        width: '750px',
        height: '450px',
        data: this.contentService.getOriginalMeta(this.currentParentId),
      })

      dialogRef.afterClosed().subscribe((commentsForm: UntypedFormGroup) => {
        this.finalCall(commentsForm)
      })
    }
  }

  finalCall(commentsForm: UntypedFormGroup) {
    if (commentsForm) {
      const body: NSApiRequest.IForwardBackwardActionGeneral = {
        comment: commentsForm.controls.comments.value,
        operation:
          commentsForm.controls.action.value === 'accept' ||
            ['Draft', 'Live'].includes(
              this.contentService.originalContent[this.currentParentId].status,
            )
            ? 1
            : 0,
      }
      const updatedMeta = this.contentService.getUpdatedMeta(this.currentParentId)
      const needSave =
        Object.keys(this.contentService.upDatedContent || {}).length ||
        Object.keys(this.storeService.changedHierarchy).length
      const saveCall = (needSave ? this.triggerSave() : of({} as any)).pipe(
        mergeMap(() =>
          this.editorService
            .forwardBackward(
              body,
              this.currentParentId,
              this.contentService.originalContent[this.currentParentId].status,
            )
            .pipe(
              mergeMap(() =>
                this.notificationSvc
                  .triggerPushPullNotification(
                    updatedMeta,
                    body.comment,
                    body.operation ? true : false,
                  )
                  .pipe(
                    catchError(() => {
                      return of({} as any)
                    }),
                  ),
              ),
            ),
        ),
      )
      this.loaderService.changeLoad.next(true)
      saveCall.subscribe(
        () => {
          this.loaderService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: this.getMessage('success'),
            },
            duration: NOTIFICATION_TIME * 1000,
          })
          this.contents = this.contents.filter(v => v.identifier !== this.currentParentId)
          if (this.contents.length) {
            this.contentService.changeActiveCont.next(this.contents[0].identifier)
          } else {
            this.router.navigateByUrl('/author/home')
          }
        },
        (error: any) => {
          if (error.status === 409) {
            const errorMap = new Map<string, NSContent.IContentMeta>()
            Object.keys(this.contentService.originalContent).forEach(v =>
              errorMap.set(v, this.contentService.originalContent[v]),
            )
            const dialog = this.dialog.open(ErrorParserComponent, {
              width: '80vw',
              height: '90vh',
              data: {
                errorFromBackendData: error.error,
                dataMapping: errorMap,
              },
            })
            dialog.afterClosed().subscribe(v => {
              if (v) {
                if (typeof v === 'string') {
                  this.storeService.selectedNodeChange.next(
                    (this.storeService.lexIdMap.get(v) as number[])[0],
                  )
                  this.contentService.changeActiveCont.next(v)
                } else {
                  this.storeService.selectedNodeChange.next(v)
                  this.contentService.changeActiveCont.next(
                    this.storeService.uniqueIdMap.get(v) as string,
                  )
                }
              }
            })
          }
          this.loaderService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: this.getMessage('failure'),
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
      )
    }
  }

  preview(id: string) {
    const updatedContent = this.contentService.upDatedContent || {}
    const saveCall =
      Object.keys(updatedContent).length || Object.keys(this.storeService.changedHierarchy).length
        ? this.triggerSave()
        : of({} as any)
    this.loaderService.changeLoad.next(true)
    saveCall.subscribe(
      () => {
        this.mimeTypeRoute = VIEWER_ROUTE_FROM_MIME(
          this.contentService.getUpdatedMeta(id).mimeType as any,
        )
        this.loaderService.changeLoad.next(false)
        this.previewIdentifier = id
      },
      error => {
        if (error.status === 409) {
          const errorMap = new Map<string, NSContent.IContentMeta>()
          Object.keys(this.contentService.originalContent).forEach(v =>
            errorMap.set(v, this.contentService.originalContent[v]),
          )
          const dialog = this.dialog.open(ErrorParserComponent, {
            width: '750px',
            height: '450px',
            data: {
              errorFromBackendData: error.error,
              dataMapping: errorMap,
            },
          })
          dialog.afterClosed().subscribe(v => {
            if (v) {
              if (typeof v === 'string') {
                this.storeService.selectedNodeChange.next(
                  (this.storeService.lexIdMap.get(v) as number[])[0],
                )
                this.contentService.changeActiveCont.next(v)
              } else {
                this.storeService.selectedNodeChange.next(v)
                this.contentService.changeActiveCont.next(
                  this.storeService.uniqueIdMap.get(v) as string,
                )
              }
            }
          })
        }
        this.loaderService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SAVE_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      },
    )
  }

  closePreview() {
    this.previewIdentifier = null
  }

  triggerSave() {
    const nodesModified: any = {}
    let isRootPresent = false
    Object.keys(this.contentService.upDatedContent).forEach(v => {
      if (!isRootPresent) {
        isRootPresent = this.storeService.parentNode.includes(v)
      }
      nodesModified[v] = {
        isNew: false,
        root: this.storeService.parentNode.includes(v),
        metadata: this.contentService.upDatedContent[v],
      }
    })
    if (!isRootPresent) {
      nodesModified[this.currentParentId] = {
        isNew: false,
        root: true,
        metadata: {},
      }
    }
    const requestBody: NSApiRequest.IContentUpdate = {
      nodesModified,
      hierarchy: this.storeService.changedHierarchy,
    }

    return this.editorService.updateContentV2(requestBody).pipe(
      tap(() => {
        this.storeService.changedHierarchy = {}
        Object.keys(this.contentService.upDatedContent).forEach(id => {
          this.contentService.resetOriginalMeta(this.contentService.upDatedContent[id], id)
        })
        this.contentService.upDatedContent = {}
        // window.location.reload()
      }),
    )
  }

  getMessage(type: 'success' | 'failure') {
    if (type === 'success') {
      switch (this.contentService.originalContent[this.currentParentId].status) {
        case 'Draft':
        case 'Live':
          return Notify.SEND_FOR_REVIEW_SUCCESS
        case 'InReview':
          return Notify.REVIEW_SUCCESS
        case 'Reviewed':
          return Notify.PUBLISH_SUCCESS
        default:
          return ''
      }
    }
    switch (this.contentService.originalContent[this.currentParentId].status) {
      case 'Draft':
      case 'Live':
        return Notify.SEND_FOR_REVIEW_FAIL
      case 'InReview':
        return Notify.REVIEW_FAIL
      case 'Reviewed':
        return Notify.PUBLISH_FAIL
      default:
        return ''
    }
  }

  subAction(event: { type: string; identifier: string, nodeClicked?: boolean }) {
    // const nodeClicked = event.nodeClicked
    this.contentService.changeActiveCont.next(event.identifier)
    switch (event.type) {
      case 'editMeta':
        this.viewMode = 'meta'
        break
      case 'editContent':
        if (event.nodeClicked === false) {
          //  this.save('refresh')
        }

        const content = this.contentService.getUpdatedMeta(event.identifier)
        if (['application/pdf', 'application/x-mpegURL'].includes(content.mimeType)) {
          this.viewMode = 'upload'
        } else if (['video/x-youtube', 'application/html'].includes(content.mimeType) && content.fileType === 'link') {
          this.viewMode = 'curate'
        } else if (content.mimeType === 'application/html') {
          this.viewMode = 'upload'
        } else if (content.mimeType === 'application/quiz') {
          this.viewMode = 'assessment'
        } else if (content.mimeType === 'application/web-module') {
          this.viewMode = 'webmodule'
        }
        // this.save()
        // localStorage.setItem('afterClick', nodeClicked)
        // if (nodeClicked) {
        //   window.location.reload()
        // }
        // this.routerValuesCall()

        break
      case 'preview':
        this.preview(event.identifier)
        break
      case 'showAddChapter':
        this.showAddchapter = false
    }
  }

  action(type: string) {
    switch (type) {
      case 'next':
        this.viewMode = 'meta'
        break

      case 'refresh':
        window.location.reload()
        break

      case 'scroll':

        const el = document.getElementById('edit-meta')
        if (el) {
          el.scrollIntoView()
        }

        break

      case 'save':
        this.save()
        break

      case 'saveAndNext':
        this.save('next')
        break

      case 'preview':
        this.preview(this.currentContent)
        break

      case 'push':
        if (this.getAction() === 'publish') {
          const dialogRefForPublish = this.dialog.open(ConfirmDialogComponent, {
            width: '70%',
            data: 'publishMessage',
          })
          dialogRefForPublish.afterClosed().subscribe(result => {
            if (result) {
              this.takeAction()
            }
          })
        } else {
          this.takeAction()
        }
        break

      case 'delete':
        const dialog = this.dialog.open(DeleteDialogComponent, {
          width: '600px',
          height: 'auto',
          data: this.contentService.getUpdatedMeta(this.currentParentId),
        })
        dialog.afterClosed().subscribe(confirm => {
          if (confirm) {
            this.contents = this.contents.filter(v => v.identifier !== this.currentParentId)
            if (this.contents.length) {
              this.contentService.changeActiveCont.next(this.contents[0].identifier)
            } else {
              this.router.navigateByUrl('/author/home')
            }
          }
        })
        break

      case 'fullscreen':
        this.fullScreenToggle()
        break

      case 'close':
        this.router.navigateByUrl('/author/home')
        break
    }
  }

  delete() {
    this.loaderService.changeLoad.next(true)
    this.editorService.deleteContent(this.currentParentId).subscribe(
      () => {
        this.loaderService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        this.contents = this.contents.filter(v => v.identifier !== this.currentParentId)
        if (this.contents.length) {
          this.contentService.changeActiveCont.next(this.contents[0].identifier)
        } else {
          this.router.navigateByUrl('/author/home')
        }
      },
      error => {
        if (error.status === 409) {
          const errorMap = new Map<string, NSContent.IContentMeta>()
          Object.keys(this.contentService.originalContent).forEach(v =>
            errorMap.set(v, this.contentService.originalContent[v]),
          )
          const dialog = this.dialog.open(ErrorParserComponent, {
            width: '750px',
            height: '450px',
            data: {
              errorFromBackendData: error.error,
              dataMapping: errorMap,
            },
          })
          dialog.afterClosed().subscribe(v => {
            if (v) {
              if (typeof v === 'string') {
                this.storeService.selectedNodeChange.next(
                  (this.storeService.lexIdMap.get(v) as number[])[0],
                )
                this.contentService.changeActiveCont.next(v)
              } else {
                this.storeService.selectedNodeChange.next(v)
                this.contentService.changeActiveCont.next(
                  this.storeService.uniqueIdMap.get(v) as string,
                )
              }
            }
          })
        }
        this.loaderService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.CONTENT_FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      },
    )
  }

  fullScreenToggle = () => {
    const doc: any = document
    const elm: any = doc.getElementById('auth-toc')
    if (elm.requestFullscreen) {
      !doc.fullscreenElement ? elm.requestFullscreen() : doc.exitFullscreen()
    } else if (elm.mozRequestFullScreen) {
      !doc.mozFullScreen ? elm.mozRequestFullScreen() : doc.mozCancelFullScreen()
    } else if (elm.msRequestFullscreen) {
      !doc.msFullscreenElement ? elm.msRequestFullscreen() : doc.msExitFullscreen()
    } else if (elm.webkitRequestFullscreen) {
      !doc.webkitIsFullscreen ? elm.webkitRequestFullscreen() : doc.webkitCancelFullscreen()
    }
  }

  getAction(): string {
    switch (this.contentService.originalContent[this.currentParentId].status) {
      case 'Draft':
      case 'Live':
        return 'sendForReview'
      case 'InReview':
        return 'review'
      case 'Reviewed':
        const isDraftPresent = this.contentService.resetStatus()
        /**Change all content as draft, if one of the content is draft status */
        if (isDraftPresent) {
          this.contentService.changeStatusDraft()
          return 'sendForReview'
        }
        return 'publish'
      default:
        return 'sendForReview'
    }
  }

  canDelete() {
    return (
      this.accessControlSvc.hasRole(['editor', 'admin']) ||
      (['Draft', 'Live'].includes(
        this.contentService.originalContent[this.currentParentId].status,
      ) &&
        this.contentService.originalContent[this.currentParentId].creatorContacts.find(
          v => v.id === this.accessControlSvc.userId,
        ))
    )
  }
}
