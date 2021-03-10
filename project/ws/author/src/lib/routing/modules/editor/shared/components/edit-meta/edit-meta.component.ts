import { COMMA, ENTER } from '@angular/cdk/keycodes'
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { MatAutocompleteSelectedEvent } from '@angular/material'
import { MatChipInputEvent } from '@angular/material/chips'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { VIEWER_ROUTE_FROM_MIME } from '@ws-widget/collection/src/public-api'
import { ConfigurationsService } from '@ws-widget/utils'
import { ImageCropComponent } from '@ws-widget/utils/src/public-api'
import { CONTENT_BASE_STATIC } from '@ws/author/src/lib/constants/apiEndpoints'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { IMAGE_MAX_SIZE, IMAGE_SUPPORT_TYPES } from '@ws/author/src/lib/constants/upload'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
import { EditorService } from '@ws/author/src/lib/routing/modules/editor/services/editor.service'
import { Observable, of, Subscription } from 'rxjs'
import { InterestService } from '../../../../../../../../../app/src/lib/routes/profile/routes/interest/services/interest.service'
import { UploadService } from '../../services/upload.service'
import { CatalogSelectComponent } from '../catalog-select/catalog-select.component'
import { IFormMeta } from './../../../../../../interface/form'
import { AccessControlService } from './../../../../../../modules/shared/services/access-control.service'
import { AuthInitService } from './../../../../../../services/init.service'
import { LoaderService } from './../../../../../../services/loader.service'
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  startWith,
  switchMap,
  map,
} from 'rxjs/operators'

@Component({
  selector: 'ws-auth-edit-meta',
  templateUrl: './edit-meta.component.html',
  styleUrls: ['./edit-meta.component.scss'],
})
export class EditMetaComponent implements OnInit, OnDestroy, AfterViewInit {
  contentMeta!: NSContent.IContentMeta
  @Output() data = new EventEmitter<string>()
  @Input() isSubmitPressed = false
  @Input() nextAction = 'done'
  @Input() stage = 3
  location = CONTENT_BASE_STATIC
  selectable = true
  removable = true
  addOnBlur = true
  addConcepts = false
  isFileUploaded = false
  fileUploadForm!: FormGroup
  creatorContactsCtrl!: FormControl
  trackContactsCtrl!: FormControl
  publisherDetailsCtrl!: FormControl
  editorsCtrl!: FormControl
  creatorDetailsCtrl!: FormControl
  audienceCtrl!: FormControl
  jobProfileCtrl!: FormControl
  regionCtrl!: FormControl
  accessPathsCtrl!: FormControl
  keywordsCtrl!: FormControl
  contentForm!: FormGroup
  selectedSkills: string[] = []
  canUpdate = true
  ordinals!: any
  resourceTypes: string[] = []
  employeeList: any[] = []
  audienceList: any[] = []
  jobProfileList: any[] = []
  regionList: any[] = []
  accessPathList: any[] = []
  infoType = ''
  isSiemens = false
  fetchTagsStatus: 'done' | 'fetching' | null = null
  readonly separatorKeysCodes: number[] = [ENTER, COMMA]
  selectedIndex = 0
  hours = 0
  minutes = 0
  seconds = 0
  @Input() parentContent: string | null = null
  routerSubscription!: Subscription
  imageTypes = IMAGE_SUPPORT_TYPES
  canExpiry = true
  showMoreGlance = false
  complexityLevelList: string[] = []
  isEditEnabled = false

  @ViewChild('creatorContactsView', { static: false }) creatorContactsView!: ElementRef
  @ViewChild('trackContactsView', { static: false }) trackContactsView!: ElementRef
  @ViewChild('publisherDetailsView', { static: false }) publisherDetailsView!: ElementRef
  @ViewChild('editorsView', { static: false }) editorsView!: ElementRef
  @ViewChild('creatorDetailsView', { static: false }) creatorDetailsView!: ElementRef
  @ViewChild('audienceView', { static: false }) audienceView!: ElementRef
  @ViewChild('jobProfileView', { static: false }) jobProfileView!: ElementRef
  @ViewChild('regionView', { static: false }) regionView!: ElementRef
  @ViewChild('accessPathsView', { static: false }) accessPathsView!: ElementRef
  @ViewChild('keywordsSearch', { static: true }) keywordsSearch!: ElementRef<any>

  timer: any

  filteredOptions$: Observable<string[]> = of([])

  constructor(
    private formBuilder: FormBuilder,
    private uploadService: UploadService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private editorService: EditorService,
    private contentService: EditorContentService,
    private configSvc: ConfigurationsService,
    private ref: ChangeDetectorRef,
    private interestSvc: InterestService,
    private loader: LoaderService,
    private authInitService: AuthInitService,
    private accessService: AccessControlService,
  ) { }

  ngAfterViewInit() {
    this.ref.detach()
    this.timer = setInterval(() => {
      this.ref.detectChanges()
      // tslint:disable-next-line: align
    }, 100)
  }

  ngOnInit() {
    this.isSiemens = this.accessService.rootOrg.toLowerCase() === 'siemens'
    this.ordinals = this.authInitService.ordinals
    this.audienceList = this.ordinals.audience
    this.jobProfileList = this.ordinals.jobProfile
    this.complexityLevelList = this.ordinals.audience

    this.creatorContactsCtrl = new FormControl()
    this.trackContactsCtrl = new FormControl()
    this.publisherDetailsCtrl = new FormControl()
    this.editorsCtrl = new FormControl()
    this.creatorDetailsCtrl = new FormControl()
    this.keywordsCtrl = new FormControl('')

    this.audienceCtrl = new FormControl()
    this.jobProfileCtrl = new FormControl()
    this.regionCtrl = new FormControl()
    this.accessPathsCtrl = new FormControl()
    this.accessPathsCtrl.disable()

    this.creatorContactsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.employeeList = <any[]>[]
            this.fetchTagsStatus = 'fetching'
            return this.editorService.fetchEmployeeList(value)
          }
          return of([])
        }),
      )
      .subscribe(
        users => {
          this.employeeList = users || <string[]>[]
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'done'
        },
      )

    this.trackContactsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.employeeList = <any[]>[]
            this.fetchTagsStatus = 'fetching'
            return this.editorService.fetchEmployeeList(value)
          }
          return of([])
        }),
      )
      .subscribe(
        users => {
          this.employeeList = users || <string[]>[]
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'done'
        },
      )

    this.publisherDetailsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.employeeList = <any[]>[]
            this.fetchTagsStatus = 'fetching'
            return this.editorService.fetchEmployeeList(value)
          }
          return of([])
        }),
      )
      .subscribe(
        users => {
          this.employeeList = users || <string[]>[]
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'done'
        },
      )

    this.editorsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.employeeList = <any[]>[]
            this.fetchTagsStatus = 'fetching'
            return this.editorService.fetchEmployeeList(value)
          }
          return of([])
        }),
      )
      .subscribe(
        users => {
          this.employeeList = users || <string[]>[]
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'done'
        },
      )

    this.creatorDetailsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter(val => typeof val === 'string'),
        switchMap((value: string) => {
          if (typeof value === 'string' && value) {
            this.employeeList = <any[]>[]
            this.fetchTagsStatus = 'fetching'
            return this.editorService.fetchEmployeeList(value)
          }
          return of([])
        }),
      )
      .subscribe(
        users => {
          this.employeeList = users || <string[]>[]
          this.fetchTagsStatus = 'done'
        },
        () => {
          this.fetchTagsStatus = 'done'
        },
      )

    this.audienceCtrl.valueChanges.subscribe(() => this.fetchAudience())

    this.jobProfileCtrl.valueChanges.subscribe(() => this.fetchJobProfile())

    this.regionCtrl.valueChanges
      .pipe(
        debounceTime(400),
        filter(v => v),
      )
      .subscribe(() => this.fetchRegion())

    this.accessPathsCtrl.valueChanges.pipe(
      debounceTime(400),
      filter(v => v),
    ).subscribe(() => this.fetchAccessRestrictions())

    this.contentService.changeActiveCont.subscribe(data => {
      if (this.contentMeta && this.canUpdate) {
        this.storeData()
      }
      this.content = this.contentService.getUpdatedMeta(data)
    })

    this.filteredOptions$ = this.keywordsCtrl.valueChanges.pipe(
      startWith(this.keywordsCtrl.value),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(value => this.interestSvc.fetchAutocompleteInterestsV2(value)),
    )
  }

  optionSelected(keyword: string) {
    this.keywordsCtrl.setValue(' ')
    // this.keywordsSearch.nativeElement.blur()
    if (keyword && keyword.length) {
      const value = this.contentForm.controls.keywords.value || []
      if (value.indexOf(keyword) === -1) {
        value.push(keyword)
        this.contentForm.controls.keywords.setValue(value)
      }
    }
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe()
    }
    this.loader.changeLoad.next(false)
    this.ref.detach()
    clearInterval(this.timer)
  }

  private set content(contentMeta: NSContent.IContentMeta) {
    this.contentMeta = contentMeta
    this.isEditEnabled = this.contentService.hasAccess(
      contentMeta,
      false,
      this.parentContent ? this.contentService.getUpdatedMeta(this.parentContent) : undefined,
    )
    this.contentMeta.name = contentMeta.name === 'Untitled Content' ? '' : contentMeta.name
    this.canExpiry = this.contentMeta.expiryDate !== '99991231T235959+0000'
    if (this.canExpiry) {
      this.contentMeta.expiryDate =
        contentMeta.expiryDate && contentMeta.expiryDate.indexOf('+') === 15
          ? <any>this.convertToISODate(contentMeta.expiryDate)
          : ''
    }
    this.assignFields()
    this.setDuration(contentMeta.duration || 0)
    this.filterOrdinals()
    this.changeResourceType()
  }

  filterOrdinals() {
    this.complexityLevelList = []
    this.ordinals.complexityLevel.map((v: any) => {
      if (v.condition) {
        let canAdd = false
          // tslint:disable-next-line: whitespace
          ; (v.condition.showFor || []).map((con: any) => {
            let innerCondition = false
            Object.keys(con).map(meta => {
              if (
                con[meta].indexOf(
                  (this.contentForm.controls[meta] && this.contentForm.controls[meta].value) ||
                  this.contentMeta[meta as keyof NSContent.IContentMeta],
                ) > -1
              ) {
                innerCondition = true
              }
            })
            if (innerCondition) {
              canAdd = true
            }
          })
        if (canAdd) {
          // tslint:disable-next-line: semicolon // tslint:disable-next-line: whitespace
          ; (v.condition.nowShowFor || []).map((con: any) => {
            let innerCondition = false
            Object.keys(con).map(meta => {
              if (
                con[meta].indexOf(
                  (this.contentForm.controls[meta] && this.contentForm.controls[meta].value) ||
                  this.contentMeta[meta as keyof NSContent.IContentMeta],
                ) < 0
              ) {
                innerCondition = true
              }
            })
            if (innerCondition) {
              canAdd = false
            }
          })
        }
        if (canAdd) {
          this.complexityLevelList.push(v.value)
        }
      } else {
        if (typeof v === 'string') {
          this.complexityLevelList.push(v)
        } else {
          this.complexityLevelList.push(v.value)
        }
      }
    })
  }

  assignExpiryDate() {
    this.canExpiry = !this.canExpiry
    this.contentForm.controls.expiryDate.setValue(
      this.canExpiry
        ? new Date(new Date().setMonth(new Date().getMonth() + 6))
        : '99991231T235959+0000',
    )
  }
  assignFields() {
    if (!this.contentForm) {
      this.createForm()
    }
    this.canUpdate = false
    Object.keys(this.contentForm.controls).map(v => {
      try {
        if (
          this.contentMeta[v as keyof NSContent.IContentMeta] ||
          (this.authInitService.authConfig[v as keyof IFormMeta].type === 'boolean' &&
            this.contentMeta[v as keyof NSContent.IContentMeta] === false)
        ) {
          this.contentForm.controls[v].setValue(this.contentMeta[v as keyof NSContent.IContentMeta])
        } else {
          if (v === 'expiryDate') {
            this.contentForm.controls[v].setValue(
              new Date(new Date().setMonth(new Date().getMonth() + 6)),
            )
          } else {
            this.contentForm.controls[v].setValue(
              JSON.parse(
                JSON.stringify(
                  this.authInitService.authConfig[v as keyof IFormMeta].defaultValue[
                    this.contentMeta.contentType
                    // tslint:disable-next-line: ter-computed-property-spacing
                  ][0].value,
                ),
              ),
            )
          }
        }
        if (this.isSubmitPressed) {
          this.contentForm.controls[v].markAsDirty()
          this.contentForm.controls[v].markAsTouched()
        } else {
          this.contentForm.controls[v].markAsPristine()
          this.contentForm.controls[v].markAsUntouched()
        }
      } catch (ex) { }
    })
    this.canUpdate = true
    this.storeData()
    if (this.isSubmitPressed) {
      this.contentForm.markAsDirty()
      this.contentForm.markAsTouched()
    } else {
      this.contentForm.markAsPristine()
      this.contentForm.markAsUntouched()
    }
  }

  convertToISODate(date = ''): Date {
    try {
      return new Date(
        `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}${date.substring(
          8,
          11,
        )}:${date.substring(11, 13)}:${date.substring(13, 15)}.000Z`,
      )
    } catch (ex) {
      return new Date(new Date().setMonth(new Date().getMonth() + 6))
    }
  }

  changeMimeType() {
    const artifactUrl = this.contentForm.controls.artifactUrl.value
    if (this.contentForm.controls.contentType.value === 'Course') {
      this.contentForm.controls.mimeType.setValue('application/vnd.ekstep.content-collection')
    } else {
      this.contentForm.controls.mimeType.setValue('application/html')
      if (
        this.configSvc.instanceConfig &&
        this.configSvc.instanceConfig.authoring &&
        this.configSvc.instanceConfig.authoring.urlPatternMatching
      ) {
        this.configSvc.instanceConfig.authoring.urlPatternMatching.map(v => {
          if (artifactUrl.match(v.pattern) && v.allowIframe && v.source === 'youtube') {
            this.contentForm.controls.mimeType.setValue('video/x-youtube')
          }
        })
      }
    }
  }

  changeResourceType() {
    if (this.contentForm.controls.contentType.value === 'Resource') {
      this.resourceTypes = this.ordinals.resourceType || this.ordinals.categoryType || []
    } else {
      this.resourceTypes = this.ordinals['Offering Mode'] || this.ordinals.categoryType || []
    }

    if (this.resourceTypes.indexOf(this.contentForm.controls.categoryType.value) < 0) {
      this.contentForm.controls.resourceType.setValue('')
    }
  }

  private setDuration(seconds: any) {
    const minutes = seconds > 59 ? Math.floor(seconds / 60) : 0
    const second = seconds % 60
    this.hours = minutes ? (minutes > 59 ? Math.floor(minutes / 60) : 0) : 0
    this.minutes = minutes ? minutes % 60 : 0
    this.seconds = second || 0
  }

  timeToSeconds() {
    let total = 0
    total += this.seconds ? (this.seconds < 60 ? this.seconds : 59) : 0
    total += this.minutes ? (this.minutes < 60 ? this.minutes : 59) * 60 : 0
    total += this.hours ? this.hours * 60 * 60 : 0
    this.contentForm.controls.duration.setValue(total)
  }

  showInfo(type: string) {
    this.infoType = this.infoType === type ? '' : type
  }

  storeData() {
    try {
      const originalMeta = this.contentService.getOriginalMeta(this.contentMeta.identifier)
      if (originalMeta && this.isEditEnabled) {
        const expiryDate = this.contentForm.value.expiryDate
        const currentMeta: NSContent.IContentMeta = JSON.parse(JSON.stringify(this.contentForm.value))
        const meta = <any>{}
        if (this.canExpiry) {
          currentMeta.expiryDate = `${
            expiryDate
              .toISOString()
              .replace(/-/g, '')
              .replace(/:/g, '')
              .split('.')[0]
            }+0000`
        }
        Object.keys(currentMeta).map(v => {
          if (
            JSON.stringify(currentMeta[v as keyof NSContent.IContentMeta]) !==
            JSON.stringify(originalMeta[v as keyof NSContent.IContentMeta])
          ) {
            if (
              currentMeta[v as keyof NSContent.IContentMeta] ||
              (this.authInitService.authConfig[v as keyof IFormMeta].type === 'boolean' &&
                currentMeta[v as keyof NSContent.IContentMeta] === false)
            ) {
              meta[v as keyof NSContent.IContentMeta] = currentMeta[v as keyof NSContent.IContentMeta]
            } else {
              meta[v as keyof NSContent.IContentMeta] = JSON.parse(
                JSON.stringify(
                  this.authInitService.authConfig[v as keyof IFormMeta].defaultValue[
                    originalMeta.contentType
                    // tslint:disable-next-line: ter-computed-property-spacing
                  ][0].value,
                ),
              )
            }
          }
        })
        this.contentService.setUpdatedMeta(meta, this.contentMeta.identifier)
      }
    } catch (ex) {
      this.snackBar.open('Please Save Parent first and refresh page.')

    }
  }

  updateContentService(meta: string, value: any, event = false) {
    this.contentForm.controls[meta].setValue(value, { events: event })
    this.contentService.setUpdatedMeta({ [meta]: value } as any, this.contentMeta.identifier)
  }

  formNext(index: number) {
    this.selectedIndex = index
  }

  addKeyword(event: MatChipInputEvent): void {
    const input = event.input
    event.value
      .split(/[,]+/)
      .map((val: string) => val.trim())
      .forEach((value: string) => this.optionSelected(value))
    input.value = ''
  }

  addReferences(event: MatChipInputEvent): void {
    const input = event.input
    const value = event.value

    // Add our fruit
    if ((value || '').trim().length) {
      const oldArray = this.contentForm.controls.references.value || []
      oldArray.push({ title: '', url: value })
      this.contentForm.controls.references.setValue(oldArray)
    }

    // Reset the input value
    if (input) {
      input.value = ''
    }
  }

  removeKeyword(keyword: any): void {
    const index = this.contentForm.controls.keywords.value.indexOf(keyword)
    this.contentForm.controls.keywords.value.splice(index, 1)
    this.contentForm.controls.keywords.setValue(this.contentForm.controls.keywords.value)
  }

  removeReferences(index: number): void {
    this.contentForm.controls.references.value.splice(index, 1)
    this.contentForm.controls.references.setValue(this.contentForm.controls.references.value)
  }

  compareSkillFn(value1: { identifier: string }, value2: { identifier: string }) {
    return value1 && value2 ? value1.identifier === value2.identifier : value1 === value2
  }

  addCreatorDetails(event: MatChipInputEvent): void {
    const input = event.input
    const value = (event.value || '').trim()
    if (value) {
      this.contentForm.controls.creatorDetails.value.push({ id: '', name: value })
      this.contentForm.controls.creatorDetails.setValue(
        this.contentForm.controls.creatorDetails.value,
      )
    }
    // Reset the input value
    if (input) {
      input.value = ''
    }
  }

  removeCreatorDetails(keyword: any): void {
    const index = this.contentForm.controls.creatorDetails.value.indexOf(keyword)
    this.contentForm.controls.creatorDetails.value.splice(index, 1)
    this.contentForm.controls.creatorDetails.setValue(
      this.contentForm.controls.creatorDetails.value,
    )
  }

  addToFormControl(event: MatAutocompleteSelectedEvent, fieldName: string): void {
    const value = (event.option.value || '').trim()
    if (value && this.contentForm.controls[fieldName].value.indexOf(value) === -1) {
      this.contentForm.controls[fieldName].value.push(value)
      this.contentForm.controls[fieldName].setValue(this.contentForm.controls[fieldName].value)
    }

    this[`${fieldName}View` as keyof EditMetaComponent].nativeElement.value = ''
    this[`${fieldName}Ctrl` as keyof EditMetaComponent].setValue(null)
  }

  removeFromFormControl(keyword: any, fieldName: string): void {
    const index = this.contentForm.controls[fieldName].value.indexOf(keyword)
    this.contentForm.controls[fieldName].value.splice(index, 1)
    this.contentForm.controls[fieldName].setValue(this.contentForm.controls[fieldName].value)
  }

  conceptToggle() {
    this.addConcepts = !this.addConcepts
  }

  uploadAppIcon(file: File) {
    const formdata = new FormData()
    const fileName = file.name.replace(/[^A-Za-z0-9.]/g, '')
    if (
      !(
        IMAGE_SUPPORT_TYPES.indexOf(
          `.${fileName
            .toLowerCase()
            .split('.')
            .pop()}`,
        ) > -1
      )
    ) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.INVALID_FORMAT,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    if (file.size > IMAGE_MAX_SIZE) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.SIZE_ERROR,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    const dialogRef = this.dialog.open(ImageCropComponent, {
      width: '70%',
      data: {
        isRoundCrop: false,
        imageFile: file,
        width: 265,
        height: 150,
        isThumbnail: true,
        imageFileName: fileName,
      },
    })

    dialogRef.afterClosed().subscribe({
      next: (result: File) => {
        if (result) {
          formdata.append('content', result, fileName)
          this.loader.changeLoad.next(true)
          this.uploadService
            .upload(formdata, {
              contentId: this.contentMeta.identifier,
              contentType: CONTENT_BASE_STATIC,
            })
            .subscribe(
              data => {
                if (data.code) {
                  this.loader.changeLoad.next(false)
                  this.canUpdate = false
                  this.contentForm.controls.appIcon.setValue(data.artifactURL)
                  this.contentForm.controls.thumbnail.setValue(data.artifactURL)
                  this.contentForm.controls.posterImage.setValue(data.artifactURL)
                  this.canUpdate = true
                  this.storeData()
                  this.snackBar.openFromComponent(NotificationComponent, {
                    data: {
                      type: Notify.UPLOAD_SUCCESS,
                    },
                    duration: NOTIFICATION_TIME * 1000,
                  })
                }
              },
              () => {
                this.loader.changeLoad.next(false)
                this.snackBar.openFromComponent(NotificationComponent, {
                  data: {
                    type: Notify.UPLOAD_FAIL,
                  },
                  duration: NOTIFICATION_TIME * 1000,
                })
              },
            )
        }
      },
    })
  }
  uploadSourceIcon(file: File) {
    const formdata = new FormData()
    const fileName = file.name.replace(/[^A-Za-z0-9.]/g, '')
    if (
      !(
        IMAGE_SUPPORT_TYPES.indexOf(
          `.${fileName
            .toLowerCase()
            .split('.')
            .pop()}`,
        ) > -1
      )
    ) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.INVALID_FORMAT,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    if (file.size > IMAGE_MAX_SIZE) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.SIZE_ERROR,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    const dialogRef = this.dialog.open(ImageCropComponent, {
      width: '70%',
      data: {
        isRoundCrop: false,
        imageFile: file,
        width: 72,
        height: 72,
        isThumbnail: true,
        imageFileName: fileName,
      },
    })

    dialogRef.afterClosed().subscribe({
      next: (result: File) => {
        if (result) {
          formdata.append('content', result, fileName)
          this.loader.changeLoad.next(true)
          this.uploadService
            .upload(formdata, {
              contentId: this.contentMeta.identifier,
              contentType: CONTENT_BASE_STATIC,
            })
            .subscribe(
              data => {
                if (data.code) {
                  this.loader.changeLoad.next(false)
                  this.canUpdate = false
                  this.contentForm.controls.creatorLogo.setValue(data.artifactURL)
                  this.contentForm.controls.creatorThumbnail.setValue(data.artifactURL)
                  this.contentForm.controls.creatorPosterImage.setValue(data.artifactURL)
                  this.canUpdate = true
                  this.storeData()
                  this.snackBar.openFromComponent(NotificationComponent, {
                    data: {
                      type: Notify.UPLOAD_SUCCESS,
                    },
                    duration: NOTIFICATION_TIME * 1000,
                  })
                }
              },
              () => {
                this.loader.changeLoad.next(false)
                this.snackBar.openFromComponent(NotificationComponent, {
                  data: {
                    type: Notify.UPLOAD_FAIL,
                  },
                  duration: NOTIFICATION_TIME * 1000,
                })
              },
            )
        }
      },
    })
  }
  changeToDefaultImg($event: any) {
    $event.target.src = this.configSvc.instanceConfig
      ? this.configSvc.instanceConfig.logos.defaultContent
      : ''
  }

  showError(meta: string) {
    if (
      this.contentService.checkCondition(this.contentMeta.identifier, meta, 'required') &&
      !this.contentService.isPresent(meta, this.contentMeta.identifier)
    ) {
      if (this.isSubmitPressed) {
        return true
      }
      if (this.contentForm.controls[meta] && this.contentForm.controls[meta].touched) {
        return true
      }
      return false
    }
    return false
  }

  removeEmployee(employee: NSContent.IAuthorDetails, field: string): void {
    const index = this.contentForm.controls[field].value.indexOf(employee)
    this.contentForm.controls[field].value.splice(index, 1)
    this.contentForm.controls[field].setValue(this.contentForm.controls[field].value)
  }

  addEmployee(event: MatAutocompleteSelectedEvent, field: string) {
    if (event.option.value && event.option.value.id) {
      this.loader.changeLoad.next(true)
      const observable = ['trackContacts', 'publisherDetails'].includes(field) &&
        this.accessService.authoringConfig.doUniqueCheck
        ? this.editorService
          .checkRole(event.option.value.id)
          .pipe(
            map(
              (v: string[]) =>
                v.includes('admin') ||
                v.includes('editor') ||
                (field === 'trackContacts' && v.includes('reviewer')) ||
                (field === 'publisherDetails' && v.includes('publisher')) ||
                (field === 'publisherDetails' && event.option.value.id === this.accessService.userId),
            ),
          )
        : of(true)
      observable.subscribe(
        (data: boolean) => {
          if (data) {
            this.contentForm.controls[field].value.push({
              id: event.option.value.id,
              name: event.option.value.displayName,
            })
            this.contentForm.controls[field].setValue(this.contentForm.controls[field].value)
          } else {
            this.snackBar.openFromComponent(NotificationComponent, {
              data: {
                type: Notify.NO_ROLE,
              },
              duration: NOTIFICATION_TIME * 1000,
            })
          }
          this[`${field}View` as keyof EditMetaComponent].nativeElement.value = ''
          this[`${field}Ctrl` as keyof EditMetaComponent].setValue(null)
        },
        () => {
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.FAIL,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
        () => {
          this.loader.changeLoad.next(false)
          this[`${field}View` as keyof EditMetaComponent].nativeElement.value = ''
          this[`${field}Ctrl` as keyof EditMetaComponent].setValue(null)
        },
      )
    }
  }

  removeField(event: MatChipInputEvent) {
    // Reset the input value
    if (event.input) {
      event.input.value = ''
    }
  }

  private fetchAudience() {
    if ((this.audienceCtrl.value || '').trim()) {
      this.audienceList = this.ordinals.audience.filter(
        (v: any) => v.toLowerCase().indexOf(this.audienceCtrl.value.toLowerCase()) > -1,
      )
    } else {
      this.audienceList = this.ordinals.audience.slice()
    }
  }

  private fetchJobProfile() {
    if ((this.jobProfileCtrl.value || '').trim()) {
      this.jobProfileList = this.ordinals.jobProfile.filter(
        (v: any) => v.toLowerCase().indexOf(this.jobProfileCtrl.value.toLowerCase()) > -1,
      )
    } else {
      this.jobProfileList = this.ordinals.jobProfile.slice()
    }
  }

  private fetchRegion() {
    if ((this.regionCtrl.value || '').trim()) {
      this.regionList = this.ordinals.region.filter(
        (v: any) => v.toLowerCase().indexOf(this.regionCtrl.value.toLowerCase()) > -1,
      )
    } else {
      this.regionList = []
    }
  }

  private fetchAccessRestrictions() {
    if (this.accessPathsCtrl.value.trim()) {
      this.accessPathList = this.ordinals.accessPaths.filter((v: any) => v.toLowerCase().
        indexOf(this.accessPathsCtrl.value.toLowerCase()) === 0)
    } else {
      this.accessPathList = this.ordinals.accessPaths.slice()
    }
  }

  checkCondition(meta: string, type: 'show' | 'required' | 'disabled'): boolean {
    if (type === 'disabled' && !this.isEditEnabled) {
      return true
    }
    return this.contentService.checkCondition(this.contentMeta.identifier, meta, type)
  }

  createForm() {
    this.contentForm = this.formBuilder.group({
      accessPaths: [],
      accessibility: [],
      appIcon: [],
      artifactUrl: [],
      audience: [],
      body: [],
      catalogPaths: [],
      category: [],
      categoryType: [],
      certificationList: [],
      certificationUrl: [],
      clients: [],
      complexityLevel: [],
      concepts: [],
      contentIdAtSource: [],
      contentType: [],
      creatorContacts: [],
      customClassifiers: [],
      description: [],
      dimension: [],
      duration: [],
      editors: [],
      equivalentCertifications: [],
      expiryDate: [],
      exclusiveContent: [],
      idealScreenSize: [],
      identifier: [],
      introductoryVideo: [],
      introductoryVideoIcon: [],
      isExternal: [],
      isIframeSupported: [],
      isRejected: [],
      fileType: [],
      jobProfile: [],
      kArtifacts: [],
      keywords: [],
      learningMode: [],
      learningObjective: [],
      learningTrack: [],
      locale: [],
      mimeType: [],
      name: [],
      nodeType: [],
      org: [],
      creatorDetails: [],
      passPercentage: [],
      plagScan: [],
      playgroundInstructions: [],
      playgroundResources: [],
      postContents: [],
      posterImage: [],
      preContents: [],
      preRequisites: [],
      projectCode: [],
      publicationId: [],
      publisherDetails: [],
      references: [],
      region: [],
      registrationInstructions: [],
      resourceCategory: [],
      resourceType: [],
      sampleCertificates: [],
      skills: [],
      softwareRequirements: [],
      sourceName: [],
      creatorLogo: [],
      creatorPosterImage: [],
      creatorThumbnail: [],
      status: [],
      studyDuration: [],
      studyMaterials: [],
      subTitle: [],
      subTitles: [],
      systemRequirements: [],
      thumbnail: [],
      trackContacts: [],
      transcoding: [],
      unit: [],
      verifiers: [],
      visibility: [],
    })

    this.contentForm.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      if (this.canUpdate) {
        this.storeData()
      }
    })

    this.contentForm.controls.contentType.valueChanges.subscribe(() => {
      this.changeResourceType()
      this.filterOrdinals()
      this.changeMimeType()
      this.contentForm.controls.category.setValue(this.contentForm.controls.contentType.value)
    })

    if (this.stage === 1) {
      this.contentForm.controls.creatorContacts.valueChanges.subscribe(() => {
        this.contentForm.controls.publisherDetails.setValue(
          this.contentForm.controls.creatorContacts.value || [],
        )
      })
    }
    // resourceType
    this.contentForm.controls.resourceType.valueChanges.subscribe(() => {
      this.contentForm.controls.categoryType.setValue(this.contentForm.controls.resourceType.value)
    })

    this.contentForm.controls.resourceCategory.valueChanges.subscribe(() => {
      this.contentForm.controls.customClassifiers.setValue(
        this.contentForm.controls.resourceCategory.value,
      )
    })
  }
  openCatalogSelector() {
    const oldCatalogs = this.addCommonToCatalog(this.contentForm.controls.catalogPaths.value)
    const dialogRef = this.dialog.open(CatalogSelectComponent, {
      width: '70%',
      maxHeight: '90vh',

      data: JSON.parse(JSON.stringify(oldCatalogs)),
    })
    dialogRef.afterClosed().subscribe((response: string[]) => {
      // const catalogs = this.removeCommonFromCatalog(response)
      this.contentForm.controls.catalogPaths.setValue(response)
    })
  }

  removeSkill(skill: string) {
    const index = this.selectedSkills.indexOf(skill)
    this.selectedSkills.splice(index, 1)
  }

  // removeCatalog(index: number) {
  //   const catalogs = this.contentForm.controls.catalogPaths.value
  //   catalogs.splice(index, 1)
  //   this.contentForm.controls.catalogPaths.setValue(catalogs)
  // }

  // removeCommonFromCatalog(catalogs: string[]): string[] {
  //   const newCatalog: any[] = []
  //   catalogs.forEach(catalog => {
  //     let start = 0
  //     let end = 0
  //     start = catalog.indexOf('>')
  //     end = catalog.length
  //     newCatalog.push(catalog.slice(start + 1, end))
  //   })
  //   return newCatalog
  // }

  copyData(type: 'keyword' | 'previewUrl') {
    const selBox = document.createElement('textarea')
    selBox.style.position = 'fixed'
    selBox.style.left = '0'
    selBox.style.top = '0'
    selBox.style.opacity = '0'
    if (type === 'keyword') {
      selBox.value = this.contentForm.controls.keywords.value
    } else if (type === 'previewUrl') {
      selBox.value =
        // tslint:disable-next-line: max-line-length
        `${window.location.origin}/viewer/${VIEWER_ROUTE_FROM_MIME(
          this.contentForm.controls.mimeType.value,
        )}/${this.contentMeta.identifier}?preview=true`
    }
    document.body.appendChild(selBox)
    selBox.focus()
    selBox.select()
    document.execCommand('copy')
    document.body.removeChild(selBox)
    this.snackBar.openFromComponent(NotificationComponent, {
      data: {
        type: Notify.COPY,
      },
      duration: NOTIFICATION_TIME * 1000,
    })
  }

  addCommonToCatalog(catalogs: string[]): string[] {
    const newCatalog: any[] = []
    catalogs.forEach(catalog => {
      const prefix = 'Common>'
      if (catalog.indexOf(prefix) > -1) {
        newCatalog.push(catalog)
      } else {
        newCatalog.push(prefix.concat(catalog))
      }
    })
    return newCatalog
  }
}
