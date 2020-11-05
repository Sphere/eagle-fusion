import { Component, OnDestroy, OnInit } from '@angular/core'
// import { FormGroup } from '@angular/forms'
// import { MatDialog, MatSnackBar } from '@angular/material'
// import { ActivatedRoute, Router } from '@angular/router'
// import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
// import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
// import { IActionButton, IActionButtonConfig } from '@ws/author/src/lib/interface/action-button'
// import { NSApiRequest } from '@ws/author/src/lib/interface/apiRequest'
// import { IAuthSteps } from '@ws/author/src/lib/interface/auth-stepper'
// import { NSContent } from '@ws/author/src/lib/interface/content'
// import { CommentsDialogComponent } from '@ws/author/src/lib/modules/shared/components/comments-dialog/comments-dialog.component'
// import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
// import { ErrorParserComponent } from '@ws/author/src/lib/modules/shared/components/error-parser/error-parser.component'
// import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
// import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
// import { EditorService } from '@ws/author/src/lib/routing/modules/editor/services/editor.service'
// import { AuthInitService } from '@ws/author/src/lib/services/init.service'
// import { LoaderService } from '@ws/author/src/lib/services/loader.service'
// import { of, Subscription } from 'rxjs'
// import { mergeMap, tap } from 'rxjs/operators'
// import { VIEWER_ROUTE_FROM_MIME } from '../../../../../../../../../../../../library/ws-widget/collection/src/public-api'

@Component({
  selector: 'ws-auth-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
})
export class BaseComponent implements OnInit, OnDestroy {
  ngOnInit() {}
  ngOnDestroy() {}
  // contents: NSContent.IContentMeta[] = []
  // currentParentId!: string
  // stepper: IAuthSteps[] = [
  //   { title: 'Choose Type', disabled: true },
  //   { title: 'Content', disabled: false },
  //   { title: 'Details', disabled: false },
  // ]
  // isSubmitPressed = false
  // showLanguageBar = false
  // actionButton: IActionButtonConfig | null = null
  // currentStep = 1
  // currentContent!: string
  // activeContentSubscription: Subscription | null = null
  // routerSubscription: Subscription | null = null
  // isChanged = false
  // previewIdentifier: string | null = null
  // viewMode: 'meta' | 'upload' | 'curate' | 'quiz' | 'dnd' | 'class' | 'iap' | 'html' | 'handson' =
  //   'meta'
  // mimeTypeRoute = ''
  // constructor(
  //   private contentService: EditorContentService,
  //   private initService: AuthInitService,
  //   private loaderService: LoaderService,
  //   private dialog: MatDialog,
  //   private snackBar: MatSnackBar,
  //   private editorService: EditorService,
  //   private router: Router,
  // ) {}

  // ngOnInit() {
  //   this.contentService.changeActiveCont.subscribe(data => {
  //     this.currentContent = data
  //     if (this.contentService.getUpdatedMeta(data).contentType !== 'Resource') {
  //       this.viewMode = 'meta'
  //     }
  //   })
  //   this.stepper = this.initService.collectionConfig.stepper
  //   this.showLanguageBar = this.initService.collectionConfig.languageBar
  //   const actionButton: IActionButton[] = []
  //   this.initService.collectionConfig.actionButtons.buttons.forEach(action => {
  //     if (
  //       this.contentService.checkConditionV2(
  //         this.contentService.getOriginalMeta(this.currentContent),
  //         action.conditions,
  //       )
  //     ) {
  //       actionButton.push({
  //         title: action.title,
  //         icon: action.icon,
  //         event: action.event,
  //         conditions: action.conditions,
  //       })
  //     }
  //   })
  //   this.actionButton = {
  //     enabled: this.initService.collectionConfig.actionButtons.enabled,
  //     buttons: actionButton,
  //   }
  // }

  // ngOnDestroy() {
  //   this.loaderService.changeLoad.next(false)
  // }

  // save(nextAction?: string) {
  //   const updatedContent = this.contentService.upDatedContent || {}
  //   if (
  //     Object.keys(updatedContent).length ||
  //     Object.keys(this.storeService.changedHierarchy).length
  //   ) {
  //     this.isChanged = true
  //     this.loaderService.changeLoad.next(true)
  //     this.triggerSave().subscribe(
  //       () => {
  //         if (nextAction) {
  //           this.action(nextAction)
  //         }
  //         this.loaderService.changeLoad.next(false)
  //         this.snackBar.openFromComponent(NotificationComponent, {
  //           data: {
  //             type: Notify.SAVE_SUCCESS,
  //           },
  //           duration: NOTIFICATION_TIME * 1000,
  //         })
  //       },
  //       (error: any) => {
  //         if (error.status === 409) {
  //           const errorMap = new Map<string, NSContent.IContentMeta>()
  //           Object.keys(this.contentService.originalContent).forEach(v =>
  //             errorMap.set(v, this.contentService.originalContent[v]),
  //           )
  //           const dialog = this.dialog.open(ErrorParserComponent, {
  //             width: '80vw',
  //             height: '90vh',
  //             data: {
  //               errorFromBackendData: error.error,
  //               dataMapping: errorMap,
  //             },
  //           })
  //           dialog.afterClosed().subscribe(v => {
  //             if (v) {
  //               if (typeof v === 'string') {
  //                 this.storeService.selectedNodeChange.next(
  //                   (this.storeService.lexIdMap.get(v) as number[])[0],
  //                 )
  //                 this.contentService.changeActiveCont.next(v)
  //               } else {
  //                 this.storeService.selectedNodeChange.next(v)
  //                 this.contentService.changeActiveCont.next(
  //                   this.storeService.uniqueIdMap.get(v) as string,
  //                 )
  //               }
  //             }
  //           })
  //         }
  //         this.loaderService.changeLoad.next(false)
  //         this.snackBar.openFromComponent(NotificationComponent, {
  //           data: {
  //             type: Notify.SAVE_FAIL,
  //           },
  //           duration: NOTIFICATION_TIME * 1000,
  //         })
  //       },
  //     )
  //   } else {
  //     if (nextAction) {
  //       this.action(nextAction)
  //     } else {
  //       this.snackBar.openFromComponent(NotificationComponent, {
  //         data: {
  //           type: Notify.UP_TO_DATE,
  //         },
  //         duration: NOTIFICATION_TIME * 1000,
  //       })
  //     }
  //   }
  // }

  // get validationCheck(): boolean {
  //   const currentNodeId = this.storeService.lexIdMap.get(this.currentParentId) as number[]
  //   const returnValue = this.storeService.validationCheck(currentNodeId[0])
  //   if (returnValue) {
  //     const dialog = this.dialog.open(ErrorParserComponent, {
  //       width: '80vw',
  //       height: '90vh',
  //       data: {
  //         processErrorData: returnValue,
  //       },
  //     })
  //     dialog.afterClosed().subscribe(v => {
  //       if (v) {
  //         if (typeof v === 'string') {
  //           this.storeService.selectedNodeChange.next(
  //             (this.storeService.lexIdMap.get(v) as number[])[0],
  //           )
  //           this.contentService.changeActiveCont.next(v)
  //         } else {
  //           this.storeService.selectedNodeChange.next(v)
  //           this.contentService.changeActiveCont.next(
  //             this.storeService.uniqueIdMap.get(v) as string,
  //           )
  //         }
  //       }
  //     })
  //     return false
  //   }
  //   return true
  // }

  // takeAction() {
  //   this.isSubmitPressed = true
  //   const needSave = Object.keys(this.contentService.upDatedContent || {}).length
  //   if (!needSave && !this.isChanged) {
  //     this.snackBar.openFromComponent(NotificationComponent, {
  //       data: {
  //         type: Notify.UP_TO_DATE,
  //       },
  //       duration: NOTIFICATION_TIME * 1000,
  //     })
  //     return
  //   }
  //   if (this.validationCheck) {
  //     const dialogRef = this.dialog.open(CommentsDialogComponent, {
  //       width: '750px',
  //       height: '450px',
  //       data: this.contentService.getOriginalMeta(this.currentContent),
  //     })

  //     dialogRef.afterClosed().subscribe((commentsForm: FormGroup) => {
  //       this.finalCall(commentsForm)
  //     })
  //   }
  // }

  // finalCall(commentsForm: FormGroup) {
  //   if (commentsForm) {
  //     const body: NSApiRequest.IForwardBackwardActionGeneral = {
  //       comment: commentsForm.controls.comments.value,
  //       operation:
  //         commentsForm.controls.action.value === 'accept' ||
  //         ['Draft', 'Live'].includes(
  //           this.contentService.originalContent[this.currentParentId].status,
  //         )
  //           ? 1
  //           : 0,
  //     }

  //     const needSave =
  //       Object.keys(this.contentService.upDatedContent || {}).length ||
  //       Object.keys(this.storeService.changedHierarchy).length
  //     const saveCall = (needSave ? this.triggerSave() : of({} as any)).pipe(
  //       mergeMap(() =>
  //         this.editorService.forwardBackward(
  //           body,
  //           this.currentParentId,
  //           this.contentService.originalContent[this.currentParentId].status,
  //         ),
  //       ),
  //     )
  //     this.loaderService.changeLoad.next(true)
  //     saveCall.subscribe(
  //       () => {
  //         this.loaderService.changeLoad.next(false)
  //         this.snackBar.openFromComponent(NotificationComponent, {
  //           data: {
  //             type: this.getMessage('success'),
  //           },
  //           duration: NOTIFICATION_TIME * 1000,
  //         })
  //         this.contents = this.contents.filter(v => v.identifier !== this.currentParentId)
  //         if (this.contents.length) {
  //           this.contentService.changeActiveCont.next(this.contents[0].identifier)
  //         } else {
  //           this.router.navigateByUrl('/author/home')
  //         }
  //       },
  //       (error: any) => {
  //         if (error.status === 409) {
  //           const errorMap = new Map<string, NSContent.IContentMeta>()
  //           Object.keys(this.contentService.originalContent).forEach(v =>
  //             errorMap.set(v, this.contentService.originalContent[v]),
  //           )
  //           const dialog = this.dialog.open(ErrorParserComponent, {
  //             width: '80vw',
  //             height: '90vh',
  //             data: {
  //               errorFromBackendData: error.error,
  //               dataMapping: errorMap,
  //             },
  //           })
  //           dialog.afterClosed().subscribe(v => {
  //             if (v) {
  //               if (typeof v === 'string') {
  //                 this.storeService.selectedNodeChange.next(
  //                   (this.storeService.lexIdMap.get(v) as number[])[0],
  //                 )
  //                 this.contentService.changeActiveCont.next(v)
  //               } else {
  //                 this.storeService.selectedNodeChange.next(v)
  //                 this.contentService.changeActiveCont.next(
  //                   this.storeService.uniqueIdMap.get(v) as string,
  //                 )
  //               }
  //             }
  //           })
  //         }
  //         this.loaderService.changeLoad.next(false)
  //         this.snackBar.openFromComponent(NotificationComponent, {
  //           data: {
  //             type: this.getMessage('failure'),
  //           },
  //           duration: NOTIFICATION_TIME * 1000,
  //         })
  //       },
  //     )
  //   }
  // }

  // preview(id: string) {
  //   const updatedContent = this.contentService.upDatedContent || {}
  //   const saveCall =
  //     Object.keys(updatedContent).length || Object.keys(this.storeService.changedHierarchy).length
  //       ? this.triggerSave()
  //       : of({} as any)
  //   this.loaderService.changeLoad.next(true)
  //   saveCall.subscribe(
  //     () => {
  //       this.mimeTypeRoute = VIEWER_ROUTE_FROM_MIME(
  //         this.contentService.getUpdatedMeta(id).mimeType as any,
  //       )
  //       this.loaderService.changeLoad.next(false)
  //       this.previewIdentifier = id
  //     },
  //     error => {
  //       if (error.status === 409) {
  //         const errorMap = new Map<string, NSContent.IContentMeta>()
  //         Object.keys(this.contentService.originalContent).forEach(v =>
  //           errorMap.set(v, this.contentService.originalContent[v]),
  //         )
  //         const dialog = this.dialog.open(ErrorParserComponent, {
  //           width: '750px',
  //           height: '450px',
  //           data: {
  //             errorFromBackendData: error.error,
  //             dataMapping: errorMap,
  //           },
  //         })
  //         dialog.afterClosed().subscribe(v => {
  //           if (v) {
  //             if (typeof v === 'string') {
  //               this.storeService.selectedNodeChange.next(
  //                 (this.storeService.lexIdMap.get(v) as number[])[0],
  //               )
  //               this.contentService.changeActiveCont.next(v)
  //             } else {
  //               this.storeService.selectedNodeChange.next(v)
  //               this.contentService.changeActiveCont.next(
  //                 this.storeService.uniqueIdMap.get(v) as string,
  //               )
  //             }
  //           }
  //         })
  //       }
  //       this.loaderService.changeLoad.next(false)
  //       this.snackBar.openFromComponent(NotificationComponent, {
  //         data: {
  //           type: Notify.SAVE_FAIL,
  //         },
  //         duration: NOTIFICATION_TIME * 1000,
  //       })
  //     },
  //   )
  // }

  // closePreview() {
  //   this.previewIdentifier = null
  // }

  // triggerSave() {
  //   const nodesModified: any = {}
  //   let isRootPresent = false
  //   Object.keys(this.contentService.upDatedContent).forEach(v => {
  //     if (!isRootPresent) {
  //       isRootPresent = this.storeService.parentNode.includes(v)
  //     }
  //     nodesModified[v] = {
  //       isNew: false,
  //       root: this.storeService.parentNode.includes(v),
  //       metadata: this.contentService.upDatedContent[v],
  //     }
  //   })
  //   if (!isRootPresent) {
  //     nodesModified[this.currentParentId] = {
  //       isNew: false,
  //       root: true,
  //       metadata: {},
  //     }
  //   }
  //   const requestBody: NSApiRequest.IContentUpdate = {
  //     nodesModified,
  //     hierarchy: this.storeService.changedHierarchy,
  //   }
  //   return this.editorService.updateContentV2(requestBody).pipe(
  //     tap(() => {
  //       this.storeService.changedHierarchy = {}
  //       Object.keys(this.contentService.upDatedContent).forEach(id => {
  //         this.contentService.resetOriginalMeta(this.contentService.upDatedContent[id], id)
  //       })
  //       this.contentService.upDatedContent = {}
  //     }),
  //   )
  // }

  // getMessage(type: 'success' | 'failure') {
  //   if (type === 'success') {
  //     switch (this.contentService.originalContent[this.currentContent].status) {
  //       case 'Draft':
  //       case 'Live':
  //         return Notify.SEND_FOR_REVIEW_SUCCESS
  //       case 'InReview':
  //         return Notify.REVIEW_SUCCESS
  //       case 'Reviewed':
  //         return Notify.PUBLISH_SUCCESS
  //       default:
  //         return ''
  //     }
  //   }
  //   switch (this.contentService.originalContent[this.currentContent].status) {
  //     case 'Draft':
  //     case 'Live':
  //       return Notify.SEND_FOR_REVIEW_FAIL
  //     case 'InReview':
  //       return Notify.REVIEW_FAIL
  //     case 'Reviewed':
  //       return Notify.PUBLISH_FAIL
  //     default:
  //       return ''
  //   }
  // }

  // subAction(event: { type: string; identifier: string }) {
  //   this.contentService.changeActiveCont.next(event.identifier)
  //   switch (event.type) {
  //     case 'editMeta':
  //       this.viewMode = 'meta'
  //       break
  //     case 'editContent':
  //       const content = this.contentService.getUpdatedMeta(event.identifier)
  //       if (['application/pdf', 'application/x-mpegURL'].includes(content.mimeType)) {
  //         this.viewMode = 'upload'
  //       } else {
  //         this.viewMode = 'curate'
  //       }
  //       break
  //     case 'preview':
  //       this.preview(event.identifier)
  //       break
  //   }
  // }

  // action(type: string) {
  //   switch (type) {
  //     case 'next':
  //       this.viewMode = 'meta'
  //       break

  //     case 'save':
  //       this.save()
  //       break

  //     case 'saveAndNext':
  //       this.save('next')
  //       break

  //     case 'preview':
  //       this.preview(this.currentParentId)
  //       break

  //     case 'push':
  //       if (this.getAction() === 'publish') {
  //         const dialogRefForPublish = this.dialog.open(ConfirmDialogComponent, {
  //           width: '70%',
  //           data: 'publishMessage',
  //         })
  //         dialogRefForPublish.afterClosed().subscribe(result => {
  //           if (result) {
  //             this.takeAction()
  //           }
  //         })
  //       } else {
  //         this.takeAction()
  //       }
  //       break

  //     case 'delete':
  //       const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //         width: '500px',
  //         height: '175px',
  //         data: 'delete',
  //       })

  //       dialogRef.afterClosed().subscribe((confirm: any) => {
  //         if (confirm) {
  //           this.delete()
  //         }
  //       })
  //       break

  //     case 'fullscreen':
  //       this.fullScreenToggle()
  //       break

  //     case 'close':
  //       this.router.navigateByUrl('/author/home')
  //       break
  //   }
  // }

  // delete() {
  //   this.loaderService.changeLoad.next(true)
  //   this.editorService.deleteContent(this.currentContent).subscribe(
  //     () => {
  //       this.loaderService.changeLoad.next(false)
  //       this.snackBar.openFromComponent(NotificationComponent, {
  //         data: {
  //           type: Notify.SUCCESS,
  //         },
  //         duration: NOTIFICATION_TIME * 1000,
  //       })
  //       this.contents = this.contents.filter(v => v.identifier !== this.currentContent)
  //       if (this.contents.length) {
  //         this.contentService.changeActiveCont.next(this.contents[0].identifier)
  //       } else {
  //         this.router.navigateByUrl('/author/home')
  //       }
  //     },
  //     error => {
  //       if (error.status === 409) {
  //         const errorMap = new Map<string, NSContent.IContentMeta>()
  //         Object.keys(this.contentService.originalContent).forEach(v =>
  //           errorMap.set(v, this.contentService.originalContent[v]),
  //         )
  //         const dialog = this.dialog.open(ErrorParserComponent, {
  //           width: '750px',
  //           height: '450px',
  //           data: {
  //             errorFromBackendData: error.error,
  //             dataMapping: errorMap,
  //           },
  //         })
  //         dialog.afterClosed().subscribe(v => {
  //           if (v) {
  //             if (typeof v === 'string') {
  //               this.storeService.selectedNodeChange.next(
  //                 (this.storeService.lexIdMap.get(v) as number[])[0],
  //               )
  //               this.contentService.changeActiveCont.next(v)
  //             } else {
  //               this.storeService.selectedNodeChange.next(v)
  //               this.contentService.changeActiveCont.next(
  //                 this.storeService.uniqueIdMap.get(v) as string,
  //               )
  //             }
  //           }
  //         })
  //       }
  //       this.loaderService.changeLoad.next(false)
  //       this.snackBar.openFromComponent(NotificationComponent, {
  //         data: {
  //           type: Notify.CONTENT_FAIL,
  //         },
  //         duration: NOTIFICATION_TIME * 1000,
  //       })
  //     },
  //   )
  // }

  // fullScreenToggle = () => {
  //   const doc: any = document
  //   const elm: any = doc.getElementById('auth-content')
  //   if (elm.requestFullscreen) {
  //     !doc.fullscreenElement ? elm.requestFullscreen() : doc.exitFullscreen()
  //   } else if (elm.mozRequestFullScreen) {
  //     !doc.mozFullScreen ? elm.mozRequestFullScreen() : doc.mozCancelFullScreen()
  //   } else if (elm.msRequestFullscreen) {
  //     !doc.msFullscreenElement ? elm.msRequestFullscreen() : doc.msExitFullscreen()
  //   } else if (elm.webkitRequestFullscreen) {
  //     !doc.webkitIsFullscreen ? elm.webkitRequestFullscreen() : doc.webkitCancelFullscreen()
  //   }
  // }

  // getAction(): string {
  //   switch (this.contentService.originalContent[this.currentParentId].status) {
  //     case 'Draft':
  //     case 'Live':
  //       return 'sendForReview'
  //     case 'InReview':
  //       return 'review'
  //     case 'Reviewed':
  //       return 'publish'
  //     default:
  //       return 'sendForReview'
  //   }
  // }
}
