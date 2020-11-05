import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormControl } from '@angular/forms'
import { MatSnackBar, MatDialog, MatChipInputEvent } from '@angular/material'
import { IPickerContentData, NsContent, NsContentStripSingle } from '@ws-widget/collection/src/public-api'
import { UploadService } from '@ws/author/src/lib/routing/modules/editor/shared/services/upload.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs/operators'
import { AUTHORING_CONTENT_BASE, CONTENT_BASE_WEBHOST_ASSETS } from '../../../../../../../../../constants/apiEndpoints'
import { NOTIFICATION_TIME } from '../../../../../../../../../constants/constant'
import { Notify } from '../../../../../../../../../constants/notificationMessage'
import { FILE_MAX_SIZE } from '../../../../../../../../../constants/upload'
import { NotificationComponent } from '../../../../../../../../../modules/shared/components/notification/notification.component'
import { SEARCHV6 } from './content-strip-single.constant'
import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Observable, of } from 'rxjs'
import { InterestService } from './../../../../../../../../../../../../app/src/lib/routes/profile/routes/interest/services/interest.service'

@Component({
  selector: 'ws-auth-content-strip-single',
  templateUrl: './content-strip-single.component.html',
  styleUrls: ['./content-strip-single.component.scss'],
})
export class ContentStripSingleComponent implements OnInit {
  @Output() data = new EventEmitter<{
    content: NsContentStripSingle.IContentStripSingle
    isValid: boolean
  }>()
  @Input() content!: NsContentStripSingle.IContentStripSingle
  @Input() identifier = ''
  @Input() isSubmitPressed = false
  @Input() editorMode: 'advanced' | 'basic' = 'advanced'
  form!: FormGroup
  pickerContentData!: IPickerContentData
  requestType: 'KB' | 'ids' | 'Collections' | 'api' | 'manual' | 'searchRegionRecommendation' | 'search' = 'ids'
  backUpRequestType: 'KB' | 'ids' | 'Collections' | 'api' | 'manual' | 'searchRegionRecommendation' | 'search' = 'ids'
  subscription: any
  dataType = 'authoring'
  tabs: number[] = []
  index = 0
  filterBy = 'viewCount'
  language: string[] = []
  keywords: string[] = []
  collectionId: string[] = []
  keywordsCtrl = new FormControl('')
  filteredOptions$: Observable<string[]> = of([])
  readonly separatorKeysCodes: number[] = [ENTER, COMMA]

  constructor(
    private formBuilder: FormBuilder,
    private interestSvc: InterestService,
    private snackBar: MatSnackBar,
    private loader: LoaderService,
    private uploadService: UploadService,
    private matDialog: MatDialog,
  ) { }

  getPath(...keys: any[]): AbstractControl {
    let path: AbstractControl | undefined
    let i = 0
    while (i < keys.length) {
      if (!path) {
        path = this.form.get(keys[i]) as AbstractControl
      } else {
        path = path.get(keys[i]) as AbstractControl
      }
      i = i + 1
    }
    return path as AbstractControl
  }

  optionSelected(keyword: string) {
    if (this.keywords.indexOf(keyword) < 0) {
      this.keywordsCtrl.setValue(' ')
      this.keywords.push(keyword)
      this.onSearchV6Change()
    }
  }

  getFormPath(control: FormArray, i: number, key: string): any {
    const form = control.at(i)
    return (form.get(key) as FormControl).value
  }

  addKeyword(event: MatChipInputEvent): void {
    const input = event.input
    if (input) {
      input.value = ''
    }
  }

  removeKeyword(keyword: any): void {
    const index = this.keywords.indexOf(keyword)
    this.keywords.splice(index, 1)
    this.onSearchV6Change()
  }

  ngOnInit() {
    this.pickerContentData = {
      preselected: new Set(),
      enablePreselected: true,
      availableFilters: ['contentType'],
    }
    this.filteredOptions$ = this.keywordsCtrl.valueChanges.pipe(
      startWith(this.keywordsCtrl.value),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(value => this.interestSvc.fetchAutocompleteInterestsV2(value)),
    )

    this.language = []
    if (this.content.request) {
      if (this.content.request.ids && this.content.request.ids.length) {
        this.content.request.ids.map(v =>
          (this.pickerContentData.preselected as Set<string>).add(v),
        )
        this.requestType = 'ids'
      } else if (this.content.request.searchV6) {
        this.language = this.content.request.searchV6.locale || []
        try {
          this.keywords = (this.content.request.searchV6.filters as any)[0].andFilters[0]
            .keywords || []
        } catch (_ex) {
          this.keywords = []
        }
        try {
          this.filterBy =
            Object.keys((this.content.request.searchV6.sort as any)[0])[0] || 'viewCount'
        } catch (_ex) {
          this.filterBy = 'viewCount'
        }
        try {
          this.collectionId = (this.content.request.searchV6.filters as any)[0].andFilters[0]
            .collectionsId || []
        } catch (_ex) {
          this.collectionId = []
        }
        this.collectionId.map(v => (this.pickerContentData.preselected as Set<string>).add(v))
        this.requestType = this.content.searchV6Type === 'Collections' ? 'Collections' : 'KB'
      } else if (this.content.request.search) {
        this.requestType = 'search'
      } else if (this.content.request.api) {
        this.requestType = 'api'
      } else if (this.content.request.manualData) {
        this.requestType = 'manual'
      } else if (this.content.request.searchRegionRecommendation) {
        this.requestType = 'searchRegionRecommendation'
      } else {
        this.requestType = 'ids'
      }
    }

    this.form = this.formBuilder.group({
      title: [this.content.title || ''],
      image: [this.content.image || ''],
      request: this.formBuilder.group({
        searchV6: [this.content.request ? this.content.request.searchV6 || null : null],
        ids: [this.content.request ? this.content.request.ids || null : null],
        api: [this.content.request ? this.content.request.api || null : null],
        search: [this.content.request ? this.content.request.search || null : null],
        manualData: this.formBuilder.array([]),
        searchRegionRecommendation: [
          this.content.request ? this.content.request.searchRegionRecommendation || null : null,
        ],
      }),
    })

    if (
      this.content.request &&
      this.content.request.manualData &&
      this.content.request.manualData.length
    ) {
      this.content.request.manualData.map(v => {
        this.addManualDataForm(v)
      })
    }

    this.subscription = this.getPath('request', 'ids').valueChanges.subscribe({
      next: () => {
        const set = new Set<string>()
        const lexIDs = (this.form.controls.request as FormGroup).controls.ids.value || []
        lexIDs.map((v: string) => set.add(v))
        this.pickerContentData = {
          ...this.pickerContentData,
          preselected: set,
        }
      },
    })

    this.form.valueChanges.pipe(debounceTime(100), distinctUntilChanged()).subscribe({
      next: () => {
        const value = JSON.parse(JSON.stringify(this.form.value))
        value.request.manualData = value.request.manualData.map((v: any) => {
          v.lastUpdatedOn = new Date(v.lastUpdatedOn || null)
          return v
        })
        this.content = value
        if (this.requestType === 'KB' || this.requestType === 'Collections') {
          this.content.searchV6Type = this.requestType
        } else {
          this.content.searchV6Type = null
        }
        this.content = value
        this.content.searchV6Type =
          this.requestType === 'Collections' || this.requestType === 'KB' ? this.requestType : null
        this.data.emit({
          content: value,
          isValid: this.form.valid,
        })
      },
    })
  }

  get paths(): FormArray {
    return this.form.controls.request.get('manualData') as FormArray
  }

  removeButtonClick(index: number) {
    this.paths.removeAt(index)
  }
  addManualDataForm(data?: NsContentStripSingle.IContentStrip) {
    const path = this.getPath('request', 'manualData') as FormArray

    path.push(
      this.formBuilder.group({
        title: [data ? data.title || null : null],
        lastUpdatedOn: [data && data.lastUpdatedOn ? new Date(data.lastUpdatedOn) : new Date()],
        url: [data ? data.url || null : null],
        target: [data ? data.target || '_blank' : '_blank'],
      }),
    )
  }

  onSelectionChange(confirm = false) {
    const backUpPreSelected = this.pickerContentData
    this.pickerContentData = {
      preselected: new Set(),
      enablePreselected: true,
      availableFilters: ['contentType'],
    }
    let goThrough = !confirm
    if (confirm) {
      const dialogRef = this.matDialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: 'dialog',
      })
      // tslint:disable-next-line: deprecation
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          goThrough = true
          this.keywords = []
          this.collectionId = []
          this.language = []
          this.filterBy = 'viewCount'
          this.getPath('request', 'searchV6').setValue(null)
          this.getPath('request', 'ids').setValue(null)
          this.getPath('request', 'search').setValue(null)
          this.getPath('request', 'searchRegionRecommendation').setValue(null)
          this.backUpRequestType = this.requestType
        } else {
          this.requestType = this.backUpRequestType
          this.pickerContentData = backUpPreSelected
        }
      })
    }
    if (goThrough) {
      if (this.requestType === 'KB' || this.requestType === 'Collections') {
        try {
          this.filterBy =
            Object.keys((this.getPath('request', 'searchV6').value.sort as any)[0])[0] || 'viewCount'
          const ids: string[] = (this.getPath('request', 'searchV6').value.filters as any)[0]
            .andFilters[0].collectionsId
          ids.map(v => (this.pickerContentData.preselected as Set<string>).add(v))
        } catch (_ex) {
          this.filterBy = 'viewCount'
        }
      } else if (this.requestType === 'ids') {
        this.getPath('request', 'ids').value.map((v: string) =>
          (this.pickerContentData.preselected as Set<string>).add(v),
        )
      }
    }
  }

  onIdChange(data: string[]) {
    this.getPath('request', 'ids').setValue(data)
    this.pickerContentData.preselected = new Set(data || []) as any
    this.pickerContentData = { ...this.pickerContentData }
  }

  update(key: string, value: any) {
    const form = this.form.controls.request.get(key) as AbstractControl
    form.setValue(value)
  }

  onContentSelectionChanged(event: { content: Partial<NsContent.IContent>; checked: boolean }) {
    const lexIDs = JSON.parse(JSON.stringify((this.form.controls.request as FormGroup).controls.ids.value || []))
    if (event.checked) {
      lexIDs.push(event.content.identifier)
      if (this.pickerContentData.preselected) {
        this.pickerContentData.preselected.add(event.content.identifier as string)
      }
    } else {
      lexIDs.splice(lexIDs.indexOf(event.content.identifier), 1)
      if (this.pickerContentData.preselected) {
        this.pickerContentData.preselected.delete(event.content.identifier as string)
      }
    }
    this.getPath('request', 'ids').setValue(lexIDs)
  }

  onSearchV6Change(event?: { content: Partial<NsContent.IContent>; checked: boolean },
                   ids?: string[], fromAuthChips = false) {
    const searchV6 = JSON.parse(JSON.stringify(SEARCHV6))
    searchV6.locale = [...this.language]
    searchV6.sort = [
      {
        [this.filterBy]: 'desc',
      },
    ]
    if (event) {
      if (fromAuthChips) {
        this.collectionId = ids || []
        searchV6.filters[0].andFilters[0].collectionsId = this.collectionId
        this.pickerContentData.preselected = new Set(this.collectionId) as any
      }
      if (event.checked) {
        this.collectionId = [event.content.identifier as string]
        searchV6.filters[0].andFilters[0].collectionsId = this.collectionId
        this.pickerContentData.preselected = new Set(this.collectionId) as any
      } else {
        this.collectionId = []
        this.getPath('request', 'searchV6').setValue(null, { events: false })
        delete searchV6.filters[0].andFilters
        if (this.pickerContentData.preselected) {
          this.pickerContentData.preselected = new Set()
        }
      }
    }
    if (!this.collectionId.length) {
      const searchBody = this.getPath('request', 'searchV6').value
      if (searchBody && searchBody.filters && searchBody.filters[0] && searchBody.filters[0].andFilters &&
        searchBody.filters[0].andFilters[0] && searchBody.filters[0].andFilters[0].collectionsId &&
        searchBody.filters[0].andFilters[0].collectionsId.length
      ) {
        searchV6.filters[0].andFilters[0].collectionsId = [searchBody.filters[0].andFilters[0].collectionsId[0]]
      } else {
        if (searchV6 && searchV6.filters &&
          searchV6.filters[0].andFilters &&
          searchV6.filters[0].andFilters[0] &&
          searchV6.filters[0].andFilters[0].collectionsId) {
          delete searchV6.filters[0].andFilters[0].collectionsId
        }
      }
    }
    if (this.keywords && this.keywords.length) {
      searchV6.filters[0].andFilters[0].keywords = this.keywords || []
    } else {
      if (searchV6 && searchV6.filters &&
        searchV6.filters[0].andFilters &&
        searchV6.filters[0].andFilters[0] &&
        searchV6.filters[0].andFilters[0].keywords) {
        delete searchV6.filters[0].andFilters[0].keywords
      }
    }
    if (searchV6 && searchV6.filters &&
      searchV6.filters[0].andFilters &&
      !Object.keys(searchV6.filters[0].andFilters).length) {
      delete searchV6.filters[0].andFilters
    }
    this.pickerContentData = { ...this.pickerContentData }
    this.getPath('request', 'searchV6').setValue(JSON.parse(JSON.stringify(searchV6)))
  }

  addForm() {
    this.addManualDataForm()
  }

  upload(file: File) {
    const formdata = new FormData()
    const fileName = file.name.replace(/[^A-Za-z0-9.]/g, '')
    if (!(file.type.indexOf('image/') > -1)) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.INVALID_FORMAT,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    if (file.type.indexOf('image/') > -1 && file.size > FILE_MAX_SIZE) {
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.SIZE_ERROR,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
      return
    }

    formdata.append('content', file, fileName)
    this.loader.changeLoad.next(true)
    this.uploadService
      .upload(formdata, { contentId: this.identifier, contentType: CONTENT_BASE_WEBHOST_ASSETS })
      .subscribe(
        data => {
          if (data.code) {
            this.loader.changeLoad.next(false)
            this.form.controls.image.setValue(
              `${AUTHORING_CONTENT_BASE}${encodeURIComponent(
                `/${data.artifactURL
                  .split('/')
                  .slice(3)
                  .join('/')}`,
              )}`,
            )
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
}
