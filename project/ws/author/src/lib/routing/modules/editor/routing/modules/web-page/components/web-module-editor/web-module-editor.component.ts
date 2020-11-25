import { DeleteDialogComponent } from '@ws/author/src/lib/modules/shared/components/delete-dialog/delete-dialog.component'
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { UploadAudioComponent } from '../upload-audio/upload-audio.component'
import { MatSnackBar } from '@angular/material/snack-bar'
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'

import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout'
import { map, mergeMap, tap, catchError } from 'rxjs/operators'
import { of, Observable, Subscription, forkJoin } from 'rxjs'
import { ActivatedRoute, Router } from '@angular/router'
import { FormGroup } from '@angular/forms'

import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { CommentsDialogComponent } from '@ws/author/src/lib/modules/shared/components/comments-dialog/comments-dialog.component'
import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { ErrorParserComponent } from '@ws/author/src/lib/modules/shared/components/error-parser/error-parser.component'

import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { UploadService } from '@ws/author/src/lib/routing/modules/editor/shared/services/upload.service'
import { EditorService } from '@ws/author/src/lib/routing/modules/editor/services/editor.service'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'

import { Page, ModuleObj, WebModuleData } from '../web-module.class'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { NSApiRequest } from '@ws/author/src/lib/interface/apiRequest'

import {
  CONTENT_BASE_WEBHOST_ASSETS,
  CONTENT_BASE_WEBHOST,
  STREAM_FILES,
  // AUTHORING_CONTENT_BASE,
} from '@ws/author/src/lib/constants/apiEndpoints'
import { VIEWER_ROUTE_FROM_MIME } from '@ws-widget/collection/src/public-api'
import { NOTIFICATION_TIME, WEB_MODULE_JSON_FILE_NAME } from '../../constant/web-module.constants'
import { IAudioObj } from '../../interface/page-interface'
import { PlainCKEditorComponent } from '../../../../../shared/components/plain-ckeditor/plain-ckeditor.component'
import { NotificationService } from '@ws/author/src/lib/services/notification.service'

@Component({
  selector: 'ws-auth-web-module-editor',
  templateUrl: './web-module-editor.component.html',
  styleUrls: ['./web-module-editor.component.scss'],
})

export class WebModuleEditorComponent implements OnInit, OnDestroy {

  userData: { [key: string]: WebModuleData } = {}
  currentId = ''
  selectedPage = 0
  showContent = false
  sideNavBarOpened = true
  allContents: NSContent.IContentMeta[] = []
  contentLoaded = false
  allLanguages: any[] = []
  activeContentSubscription?: Subscription
  changedContent = false
  currentStep = 2
  previewMode = false
  mimeTypeRoute: any
  submitPressed = false
  showSettingButtons = true
  mediumScreenSize = false
  mediumSizeBreakpoint$ = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small])
    .pipe(map((res: BreakpointState) => res.matches))
  mode$ = this.mediumSizeBreakpoint$.pipe(map(isMedium => (isMedium ? 'over' : 'side')))
  showAudioCard = false
  imagesUrlbase = ''
  @ViewChild(PlainCKEditorComponent, { static: false }) ckEditor!: PlainCKEditorComponent
  // @ViewChild('editor', { static: false }) ckEditor!: any
  // downloadRegex = new RegExp(`(/content-store/.*?)(\\\)?\\\\?['"])`, 'gm')

  constructor(
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private breakpointObserver: BreakpointObserver,
    private loaderService: LoaderService,
    private metaContentService: EditorContentService,
    private uploadService: UploadService,
    private editorService: EditorService,
    private authInitService: AuthInitService,
    private accessService: AccessControlService,
    private notificationSvc: NotificationService,
  ) { }

  ngOnDestroy() {
    if (this.activeContentSubscription) {
      this.activeContentSubscription.unsubscribe()
    }
  }

  // regexDownloadReplace(_str = '', group1: string, group2: string): string {
  //   return `${AUTHORING_CONTENT_BASE}${encodeURIComponent(group1)}${group2}`
  // }

  ngOnInit(): void {
    this.showSettingButtons = this.accessService.rootOrg === 'client1'
    this.mediumSizeBreakpoint$.subscribe(isLtMedium => {
      this.sideNavBarOpened = !isLtMedium
      this.mediumScreenSize = isLtMedium
      if (isLtMedium) {
        this.showContent = false
      } else {
        this.showContent = true
      }
    })
    if (this.activateRoute.parent && this.activateRoute.parent.parent) {
      this.activateRoute.parent.parent.data.subscribe(v => {
        if (v.contents && v.contents.length) {
          this.allContents.push(v.contents[0].content)
          if (v.contents[0].data) {
            const url = v.contents[0].content.artifactUrl.substring(0, v.contents[0].content.artifactUrl.lastIndexOf('/'))
            this.imagesUrlbase = `${url}/assets/`
            const formattedObj = JSON.parse(JSON.stringify(v.contents[0].data))
            formattedObj.pageJson.map((obj: ModuleObj) => {
              if (obj.audio && obj.audio.length) {
                obj.audio.map(audioObj => {
                  // audioObj.URL = JSON.parse(JSON.stringify(
                  //   audioBaseURL + audioObj.URL
                  // ).replace(this.downloadRegex, this.regexDownloadReplace))
                  audioObj.URL = this.imagesUrlbase + audioObj.URL
                  const splitUrl = audioObj.URL.split('/')
                  const hostURL = `${splitUrl[0]}//${splitUrl[2]}`
                  audioObj.URL = audioObj.URL.replace(hostURL, '')
                })
              }
            })
            const getBodyReg = /\<body[^>]*\>([^]*)\<\/body/m
            // const reg1 = RegExp(`src\=\s*['"](.*?)`, 'gm')
            // const reg2 = RegExp(`href\=\s*['"](.*?)['"]`, 'gm')
            formattedObj.pages = formattedObj.pages.map((p: any, index: number) => {
              let pageBody = p
              if (p.match(getBodyReg)) {
                pageBody = p.match(getBodyReg)[1]
                  .replace('src="', ` src="${this.imagesUrlbase}`)
                // .replace(reg2, ` href="${this.imagesUrlbase}"`)
              }
              const fileInd = parseInt(formattedObj.pageJson[index].URL.replace('/assets/index', ''), 10)
              return new Page({ body: pageBody, fileIndex: fileInd })
            })
            this.userData[v.contents[0].content.identifier] = formattedObj
          }
          this.contentLoaded = true
        }
      })
    }
    this.allLanguages = this.authInitService.ordinals.subTitles
    this.loaderService.changeLoadState(true)
    // active lex id
    this.activeContentSubscription = this.metaContentService.changeActiveCont.subscribe(id => {
      if (!this.userData[id]) {
        this.userData[id] = new WebModuleData({})
      }
      this.currentId = id
      this.changePage(0)
    })

  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.userData[this.currentId].pages, event.previousIndex, event.currentIndex)
    if (this.selectedPage === event.previousIndex) {
      this.selectedPage = event.currentIndex
    } else if (this.selectedPage === event.currentIndex) {
      this.selectedPage = event.previousIndex
    }
    this.changedContent = true
  }

  deleteAudio(num: number) {
    if (this.userData[this.currentId].pageJson[this.selectedPage].audio) {
      this.userData[this.currentId].pageJson[this.selectedPage].audio.splice(num, 1)
      this.changedContent = true
    }
  }

  checkValidity(lexId: string): Boolean {
    let returnVal = true
    for (let i = 0; i < this.userData[lexId].pages.length; i = i + 1) {
      if (!this.userData[lexId].pages[i].body) {
        this.userData[lexId].pages[i].isInvalid = true
        if (returnVal) {
          this.changePage(i)
        }
        returnVal = false
      }
    }
    return returnVal
  }

  // getErrorMessages(){
  //   let errorPages: number[] = []
  //   this.userData[this.currentId].pages.forEach((page,index)=>{
  //     if(page.isInvalid){
  //       errorPages.push(index)
  //     }
  //   })
  //   let res: { [key: number]: string} = {}
  //   errorPages.map(num=>{
  //     res[num] = Notify.WEB_MODULE_PAGE_EMPTY
  //   })
  // }

  // save title
  forTitle(event: string) {
    this.userData[this.currentId].pageJson[this.selectedPage].title = event
    this.changedContent = true
  }

  // add new page
  addPage() {
    const fileIndex = this.userData[this.currentId].pages.length ?
      this.userData[this.currentId].pages[this.userData[this.currentId].pages.length - 1].fileIndex + 1
      : 1
    const newModuleObj = new ModuleObj({ URL: `${STREAM_FILES}index${fileIndex}.html`, title: '' })
    const newPageObj = new Page({ fileIndex, body: '' })
    this.userData[this.currentId].pageJson.push(newModuleObj)
    this.userData[this.currentId].pages.push(newPageObj)
    this.changePage(this.userData[this.currentId].pages.length - 1)
    this.changedContent = true
  }

  onBodyChange(i: any) {
    this.userData[this.currentId].pages[this.selectedPage].body = i
    this.userData[this.currentId].pages[this.selectedPage].isBdchanged = true
    // on save pressed if invalid it will be set as false otherwise it would be undefined
    if (this.userData[this.currentId].pages[this.selectedPage].isInvalid
      && this.userData[this.currentId].pages[this.selectedPage].body) {
      this.userData[this.currentId].pages[this.selectedPage].isInvalid = false
    }
    this.changedContent = true
  }

  changePage(index: number) {
    this.selectedPage = index
    if (this.userData[this.currentId].pages[index] && this.userData[this.currentId].pages[index].isInvalid) {
      this.showNotification(Notify.WEB_MODULE_PAGE_EMPTY)
    }
    this.showAudioCard = false
  }

  onDelete(i: number, event: Event) {
    event.stopPropagation()
    const confirmDelete = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        type: 'deleteModulepg',
        index: i + 1,
      },
    })
    confirmDelete.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.userData[this.currentId].pageJson.splice(i, 1)
        this.userData[this.currentId].pages.splice(i, 1)
        const dataLen = this.userData[this.currentId].pages.length
        if (i === this.selectedPage) {
          this.changePage(i && dataLen ? i - 1 : i)
        } else if (this.selectedPage > dataLen && i < this.selectedPage || this.selectedPage === dataLen) {
          this.changePage(this.selectedPage - 1)
        }
        this.changedContent = true
      }
    })
  }

  audioADD() {
    const languagesForDropDown = this.allLanguages.filter(lang => {
      if (this.userData[this.currentId].pageJson[this.selectedPage].audio) {
        const audios = this.userData[this.currentId].pageJson[this.selectedPage].audio as IAudioObj[]
        for (let i = 0; i < audios.length; i = i + 1) {
          if (lang.srclang === audios[i].srclang) {
            return false
          }
        }
        return true
      }
      return true
    })
    if (languagesForDropDown.length) {
      const contentLocale = this.metaContentService.getUpdatedMeta(this.currentId).locale
      const defaultSelectedLang = languagesForDropDown.filter(l => l.srclang === contentLocale).length ?
        contentLocale : languagesForDropDown[0].srclang
      const dialogRef = this.dialog.open(UploadAudioComponent, {
        data: {
          id: this.currentId,
          srclang: defaultSelectedLang,
          languages: languagesForDropDown,
        },
        width: '500px',
      })
      dialogRef.afterClosed().subscribe((result: IAudioObj) => {
        if (result) {
          this.showAudioCard = true
          this.changedContent = true
          // if (!this.userData[this.currentId].pageJson[this.selectedPage].audio) {
          //   this.userData[this.currentId].pageJson[this.selectedPage].audio = []
          // }
          const audios = this.userData[this.currentId].pageJson[this.selectedPage].audio || []
          audios.push(result)
          this.userData[this.currentId].pageJson[this.selectedPage].audio = audios.slice()
        }
      })
    } else {
      this.showNotification(Notify.WEB_MODULE_AUDIO_ALL_LANGUAGES_PRESENT)
    }
  }

  uploadJson(data: any, fileName: string, location: '/web-hosted' | '/web-hosted/assets') {
    let content = JSON.parse(JSON.stringify(data))
    if (fileName.endsWith('.html')) {

      content = `<html><head></head><body>${content}</body></html>`
      content = content.replace(new RegExp('\r?\n?\t', 'g'), '')
      // const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'text/html' })
      // const formdata = new FormData()
      // formdata.append('content', blob, fileName)
      // return this.uploadService.upload(
      //   formdata,
      //   { contentId: this.currentId, contentType: location }
      // )
    }
    return this.uploadService.encodedUpload(
      content,
      fileName,
      { contentId: this.currentId, contentType: location },
    )
  }

  triggerUpload() {
    const moduledata = JSON.parse(JSON.stringify(this.userData[this.currentId].pageJson))
    moduledata.map((e: ModuleObj) => {
      if (e.audio && e.audio.length) {
        e.audio.map(a => {
          a.URL = STREAM_FILES + a.title
        })
      } else {
        delete e.audio
      }
    })
    const changedPages = this.userData[this.currentId].pages.filter(e => e.isBdchanged)
    const getUrlReg = new RegExp(/<img\s+[^>]*?src=("|')([^"']+)\1/)
    const res = changedPages.length ? changedPages.map(e => {
      if (!this.imagesUrlbase && e.body.match(getUrlReg)) {
        const url = (e.body.match(getUrlReg) as any)[2]
        this.imagesUrlbase = `${url.substring(0, url.lastIndexOf('/'))}/`
      }
      const htmlFile = JSON.parse(
        JSON.stringify(e.body)
          .replace(/<a href/gm, '<a target=\\"_blank\\" href')
          .replace(this.imagesUrlbase, '')
          .replace(/(<img.*width=)['"](\d+?)['"](.*\/>)/gm, '$1"$2" style="width:100%; heigth: auto; max-width:$2" $3')
      )
      // .replace(/ href=\s*['"].*?\/web-hosted\/.*?lex_.*?\/assets\/(.*?)['"]/gm, ' href="$1"')
      const fileName = `index${e.fileIndex}.html`
      return this.uploadJson(htmlFile, fileName, CONTENT_BASE_WEBHOST_ASSETS)
    }) : of({} as any)
    return forkJoin(res).pipe(
      mergeMap(() => {
        this.userData[this.currentId].pages.map(p => p.isBdchanged = false)
        return this.uploadJson(moduledata, WEB_MODULE_JSON_FILE_NAME, CONTENT_BASE_WEBHOST)
      })
    )
  }

  wrapperForTriggerSave() {
    this.loaderService.changeLoad.next(true)
    return (this.changedContent ? this.triggerUpload() : of({} as any))
      .pipe(
        mergeMap(v => {
          const updatedMeta = JSON.parse(JSON.stringify(this.metaContentService.upDatedContent[this.currentId] || {}))
          if (v && v.code) {
            updatedMeta.artifactUrl = (v.authArtifactURL || v.artifactURL).replace(/%2F/g, '/')
            updatedMeta.downloadUrl = v.downloadURL.replace(/%2F/g, '/')
            this.changedContent = false
          }
          return this.triggerSave(updatedMeta, this.currentId)
        }),
      )
  }

  triggerSave(meta: NSContent.IContentMeta, id: string) {
    const requestBody: NSApiRequest.IContentUpdate = {
      hierarchy: {},
      nodesModified: {
        [id]: {
          isNew: false,
          root: true,
          metadata: meta,
        },
      },
    }
    return this.editorService
      .updateContent(requestBody)
      .pipe(tap(() => this.metaContentService.resetOriginalMeta(meta, id)))
  }

  action(type: string) {
    switch (type) {
      case 'next':
        this.currentStep += 1
        break
      case 'preview':
        this.preview()
        break
      case 'save':
        this.save()
        break
      case 'push':
        this.takeAction()
        break
      case 'delete':
        const dialog = this.dialog.open(DeleteDialogComponent, {
          width: '600px',
          height: 'auto',
          data: this.metaContentService.getUpdatedMeta(this.currentId),
        })
        dialog.afterClosed().subscribe(confirm => {
          if (confirm) {
            this.allContents = this.allContents.filter(v => v.identifier !== this.currentId)
            if (this.allContents.length) {
              this.metaContentService.changeActiveCont.next(this.allContents[0].identifier)
            } else {
              this.router.navigateByUrl('/author/home')
            }
          }
        })
        break
      case 'close':
        this.router.navigateByUrl('/author/home')
        break
    }
  }

  delete() {
    const confirmDelete = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: 'delete',
    })
    confirmDelete.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.loaderService.changeLoad.next(true)
        this.editorService.deleteContent(this.currentId).subscribe(
          () => {
            this.loaderService.changeLoad.next(false)
            this.showNotification(Notify.SUCCESS)
            this.allContents = this.allContents.filter(v => v.identifier !== this.currentId)
            if (this.allContents.length) {
              this.metaContentService.changeActiveCont.next(this.allContents[0].identifier)
            } else {
              this.router.navigateByUrl('/author/home')
            }
          },
          () => {
            this.loaderService.changeLoad.next(false)
            this.showNotification(Notify.CONTENT_FAIL)
          },
        )
      }
    })
  }

  isPublisherSame(): boolean {
    const publisherDetails =
      this.metaContentService.getUpdatedMeta(this.currentId).publisherDetails || []
    return publisherDetails.find(v => v.id === this.accessService.userId) ? true : false
  }

  isDirectPublish(): boolean {
    return (
      ['Draft', 'Live'].includes(this.metaContentService.originalContent[this.currentId].status) &&
      this.isPublisherSame()
    )
  }

  finalCall(commentsForm: FormGroup) {
    if (commentsForm) {
      const body: NSApiRequest.IForwardBackwardActionGeneral = {
        comment: commentsForm.controls.comments.value,
        operation:
          commentsForm.controls.action.value === 'accept' ||
            ['Draft', 'Live'].includes(
              this.metaContentService.originalContent[this.currentId].status,
            )
            ? ((this.accessService.authoringConfig.isMultiStepFlow && this.isDirectPublish()) ||
              !this.accessService.authoringConfig.isMultiStepFlow) &&
              this.accessService.rootOrg.toLowerCase() === 'client1'
              ? 100000
              : 1
            : 0,
      }

      const updatedContent = this.metaContentService.upDatedContent[this.currentId] || {}
      const updatedMeta = this.metaContentService.getUpdatedMeta(this.currentId)
      const needSave = Object.keys(this.metaContentService.upDatedContent[this.currentId] || {})
        .length
      const saveCall = (needSave
        ? this.triggerSave(updatedContent, this.currentId)
        : of({} as any)
      ).pipe(
        mergeMap(() =>
          this.editorService
            .forwardBackward(
              body,
              this.currentId,
              this.metaContentService.originalContent[this.currentId].status,
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
          this.allContents = this.allContents.filter(v => v.identifier !== this.currentId)
          if (this.allContents.length) {
            this.metaContentService.changeActiveCont.next(this.allContents[0].identifier)
          } else {
            this.router.navigateByUrl('/author/home')
          }
        },
        error => {
          if (error.status === 409) {
            const errorMap = new Map<string, NSContent.IContentMeta>()
            errorMap.set(
              this.currentId,
              this.metaContentService.getUpdatedMeta(this.currentId),
            )
            this.dialog.open(ErrorParserComponent, {
              width: '80vw',
              height: '90vh',
              data: {
                errorFromBackendData: error.error,
                dataMapping: errorMap,
              },
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

  getMessage(type: 'success' | 'failure') {
    if (type === 'success') {
      switch (this.metaContentService.originalContent[this.currentId].status) {
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
    switch (this.metaContentService.originalContent[this.currentId].status) {
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

  getAction(): string {
    switch (this.metaContentService.originalContent[this.currentId].status) {
      case 'Draft':
      case 'Live':
        return 'sendForReview'
      case 'InReview':
      case 'QualityReview':
        return 'review'
      case 'Reviewed':
        return 'publish'
      default:
        return 'sendForReview'
    }
  }

  takeAction() {
    const needSave = Object.keys((this.metaContentService.upDatedContent[this.currentId] || {})).length
      || this.changedContent
    if (!needSave &&
      (this.metaContentService.getUpdatedMeta(this.currentId).status === 'Live')
    ) {
      this.showNotification(Notify.UP_TO_DATE)
      return
    }
    this.validationCheck().subscribe(valid => {
      this.loaderService.changeLoad.next(false)
      if (valid) {
        const dialogRef = this.dialog.open(CommentsDialogComponent, {
          width: '750px',
          height: '450px',
          data: this.metaContentService.getOriginalMeta(this.currentId),
        })
        dialogRef.afterClosed().subscribe((commentsForm: FormGroup) => {
          this.finalCall(commentsForm)
        })
      }
    },
      // tslint:disable-next-line: align
      () => {
        this.showNotification(Notify.SAVE_FAIL)
      },
    )
  }

  validationCheck(): Observable<boolean> {
    let returnValue = true
    if (!this.metaContentService.isValid(this.currentId) || !this.metaContentService.isValid(this.currentId)
      && !this.metaContentService.getUpdatedMeta(this.currentId).artifactUrl) {
      this.showNotification(Notify.MANDATORY_FIELD_ERROR)
      returnValue = false
    } else if (this.changedContent) {
      if (this.checkValidity(this.currentId)) {
        return this.wrapperForTriggerSave().pipe(map(() => true))
      }
      this.currentStep = 2
      returnValue = false
    }
    return of(returnValue)
  }

  preview() {
    if (this.userData[this.currentId].pages.length) {
      const needSave = this.changedContent ||
        Object.keys((this.metaContentService.upDatedContent[this.currentId] || {})).length
      if (needSave) {
        if (this.checkValidity(this.currentId)) {
          this.wrapperForTriggerSave().subscribe(() => {
            this.loaderService.changeLoad.next(false)
            this.previewMode = true
            this.mimeTypeRoute = VIEWER_ROUTE_FROM_MIME(
              this.metaContentService.getUpdatedMeta(this.currentId).mimeType as any,
            )
          },
            // tslint:disable-next-line: align
            () => {
              this.loaderService.changeLoad.next(false)
              this.showNotification(Notify.SAVE_FAIL)
            },
          )
        }
      } else {
        this.previewMode = true
        this.mimeTypeRoute = VIEWER_ROUTE_FROM_MIME(
          this.metaContentService.getUpdatedMeta(this.currentId).mimeType as any,
        )
      }
    } else {
      this.showNotification(Notify.WEB_MODULE_MIN_PAGE_REQUIRED)
    }
  }

  customStepper(step: number) {
    this.currentStep = step
    // if (step === 3 && this.currentStep === 2) {
    //   if (this.userData[this.currentId].pages.length) {
    //     this.currentStep = step
    //   } else {
    //     this.showNotification(Notify.NO_CONTENT)
    //   }
    // } else {
    //   this.currentStep = step
    // }
  }

  changeContent(data: NSContent.IContentMeta) {
    this.currentId = data.identifier
    this.metaContentService.changeActiveCont.next(data.identifier)
    this.selectedPage = 0
  }

  createInAnotherLanguage(lang: string) {
    this.loaderService.changeLoad.next(true)
    this.metaContentService.createInAnotherLanguage(lang, { artifactURL: '', downloadUrl: '' })
      .subscribe(
        data => {
          this.loaderService.changeLoad.next(false)
          if (data !== true) {
            this.allContents.push(data as NSContent.IContentMeta)
            this.changeContent(data as NSContent.IContentMeta)
            this.showNotification(Notify.CONTENT_CREATE_SUCCESS)
          } else {
            this.showNotification(Notify.DATA_PRESENT)
          }
        },
        error => {
          if (error.status === 409) {
            const errorMap = new Map<string, NSContent.IContentMeta>()
            errorMap.set(this.currentId, this.metaContentService.getUpdatedMeta(this.currentId))
            this.dialog.open(ErrorParserComponent, {
              width: '750px',
              height: '450px',
              data: {
                errorFromBackendData: error.error,
                dataMapping: errorMap,
              },
            })
          }
          this.loaderService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.CONTENT_FAIL,
            },
            duration: 3 * 1000,
          })
        },
      )
  }

  save() {
    const needSave = Object.keys((this.metaContentService.upDatedContent[this.currentId] || {})).length
      || this.changedContent
    if (this.userData[this.currentId].pages.length > 0 && (needSave)) {
      if (this.checkValidity(this.currentId)) {
        // if any change in data, then upload json
        this.wrapperForTriggerSave().subscribe(
          () => {
            this.loaderService.changeLoad.next(false)
            this.showNotification(Notify.SAVE_SUCCESS)
          },
          () => {
            this.loaderService.changeLoad.next(false)
            this.showNotification(Notify.SAVE_FAIL)
          },
        )
      } else {
        if (this.currentStep !== 2) {
          this.currentStep = 2
        }
      }
    } else {
      if (!this.userData[this.currentId].pages.length) {
        this.showNotification(Notify.WEB_MODULE_MIN_PAGE_REQUIRED)
      } else {
        this.showNotification(Notify.UP_TO_DATE)
      }
    }
  }

  showNotification(errorType: string) {
    this.snackBar.openFromComponent(NotificationComponent, {
      data: {
        type: errorType,
      },
      duration: NOTIFICATION_TIME * 1000,
    })
  }

  toggleSettingButtons() {
    this.showSettingButtons = !this.showSettingButtons
  }
  closePreview() {
    this.previewMode = false
  }

  canDelete() {
    return this.accessService.hasRole(['editor', 'admin']) ||
      (['Draft', 'Live'].includes(this.metaContentService.originalContent[this.currentId].status) &&
        this.metaContentService.originalContent[this.currentId].creatorContacts.find(v => v.id === this.accessService.userId)
      )
  }

}
