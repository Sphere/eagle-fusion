import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { MatChipInputEvent, MatDialog } from '@angular/material'
import {
  IPickerContentData,
  IWidgetElementHtml,
  NsContent,
  NsContentStripMultiple,
} from '@ws-widget/collection/src/public-api'
import { NsWidgetResolver } from '@ws-widget/resolver/src/public-api'
import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { Observable, of } from 'rxjs'
import { debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs/operators'
import { InterestService } from './../../../../../../../../../../../../app/src/lib/routes/profile/routes/interest/services/interest.service'
import { SEARCHV6 } from './content-strip-v2.constant'

@Component({
  selector: 'ws-auth-content-strip-v2',
  templateUrl: './content-strip-v2.component.html',
  styleUrls: ['./content-strip-v2.component.scss'],
})
export class ContentStripV2Component implements OnInit {
  @Output() data = new EventEmitter<{
    content: NsContentStripMultiple.IContentStripMultiple
    isValid: boolean
  }>()
  @Input() content!: NsContentStripMultiple.IContentStripMultiple
  @Input() identifier = ''
  @Input() isSubmitPressed = false
  @Input() size = 1
  form!: FormGroup
  pickerContentData!: IPickerContentData
  requestType!: 'search' | 'ids' | 'api' | 'KB' | 'Collections'
  subscription: any
  dataType = 'authoring'
  tabs: number[] = []
  index = 0
  currPreWidget = 0
  isSticky = false
  currPostWidget = 0
  currentStrip!: NsContentStripMultiple.IContentStripUnit
  filterBy = 'viewCount'
  language: string[] = []
  backUpRequestType!: 'search' | 'ids' | 'api' | 'KB' | 'Collections'
  keywords: string[] = []
  keywordsCtrl = new FormControl('')
  collectionId: string[] = []
  id = 0
  cardSubtype:
    | 'standard'
    | 'minimal'
    | 'space-saving'
    | 'card-user-details'
    | 'basic-info'
    | 'basic-details'
    | 'card-description-back' = 'standard'
  filteredOptions$: Observable<string[]> = of([])
  readonly separatorKeysCodes: number[] = [ENTER, COMMA]
  constructor(
    private interestSvc: InterestService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
  ) { }

  getPath(...keys: string[]): AbstractControl {
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
    this.form = this.formBuilder.group({
      key: [''],
      title: [''],
      stripConfig: this.formBuilder.group({
        cardSubType: [''],
        postCardForSearch: [''],
      }),
      request: this.formBuilder.group({
        searchV6: [],
        ids: [],
        api: [],
        search: [],
        searchRegionRecommendation: [],
      }),
    })

    this.filteredOptions$ = this.keywordsCtrl.valueChanges.pipe(
      startWith(this.keywordsCtrl.value),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(value => this.interestSvc.fetchAutocompleteInterestsV2(value)),
    )

    this.subscription = (this.form.controls.request.get(
      'ids',
    ) as AbstractControl).valueChanges.subscribe({
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
        this.content.strips[this.index] = {
          ...this.content.strips[this.index],
          ...this.form.value,
        }
        if (this.requestType === 'KB' || this.requestType === 'Collections') {
          this.content.strips[this.index].searchV6Type = this.requestType
        } else {
          this.content.strips[this.index].searchV6Type = null
        }
        this.data.emit({
          content: this.content,
          isValid: this.form.valid,
        })
      },
    })
    if (this.content && (!this.content.strips || !this.content.strips.length)) {
      this.content.strips = [] as any
      this.addEnd(false)
    } else {
      this.currentStrip = this.content.strips[this.index]
      this.initializeForm(this.currentStrip)
    }
  }

  onIndexChange(index: number) {
    this.index = index
    this.currentStrip = this.content.strips[index]
    this.form.reset()
    this.initializeForm(this.currentStrip)
  }

  private getUniqueId(): string {
    this.id += 1
    return (new Date().getTime() + this.id).toString()
  }

  initializeForm(strip: NsContentStripMultiple.IContentStripUnit) {
    this.currPreWidget = 0
    this.currPostWidget = 0
    const pickerContent = {
      preselected: new Set<string>(),
      enablePreselected: true,
      availableFilters: ['contentType'],
    }
    this.getPath('key').setValue(strip.key || this.getUniqueId())
    this.getPath('title').setValue(strip.title || '')
    if (strip.request) {
      if (strip.request.ids && strip.request.ids.length) {
        strip.request.ids.map(v => (pickerContent.preselected as Set<string>).add(v))
        this.requestType = 'ids'
      } else if (strip.request.searchV6) {
        this.language = strip.request.searchV6.locale || []
        try {
          this.keywords = (strip.request.searchV6.filters as any)[0].andFilters[0].keywords || []
        } catch (_ex) {
          this.keywords = []
        }
        try {
          this.filterBy = Object.keys((strip.request.searchV6.sort as any)[0])[0] || 'viewCount'
        } catch (_ex) {
          this.filterBy = 'viewCount'
        }
        try {
          this.collectionId =
            (strip.request.searchV6.filters as any)[0].andFilters[0].collectionsId || []
        } catch (_ex) {
          this.collectionId = []
        }
        this.collectionId.map(v => (pickerContent.preselected as Set<string>).add(v))
        this.requestType = strip.searchV6Type === 'Collections' ? 'Collections' : 'KB'
      } else if (strip.request.search) {
        this.requestType = 'search'
      } else if (strip.request.api) {
        this.requestType = 'api'
      } else {
        this.requestType = 'ids'
      }
      this.getPath('request', 'searchV6').setValue(strip.request.searchV6 || null)
      this.getPath('request', 'search').setValue(strip.request.search || null)
      this.getPath('request', 'api').setValue(strip.request.api || null)
      this.getPath('request', 'ids').setValue(strip.request.ids || [])
      this.getPath('request', 'searchRegionRecommendation').setValue(
        strip.request.searchRegionRecommendation || null,
      )
    }
    if (strip.stripConfig) {
      this.cardSubtype = strip.stripConfig.cardSubType || 'standard'
      this.getPath('stripConfig', 'postCardForSearch').setValue('true')
    }
    this.pickerContentData = pickerContent
    this.backUpRequestType = this.requestType
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
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: 'dialog',
      })
      // tslint:disable-next-line: deprecation
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          goThrough = true
          this.filterBy = 'viewCount'
          this.keywords = []
          this.language = []
          this.collectionId = []
          this.getPath('request', 'searchV6').setValue(null)
          this.getPath('request', 'ids').setValue(null)
          this.getPath('request', 'search').setValue(null)
          this.getPath('request', 'searchRegionRecommendation').setValue(null)
          this.getPath('stripConfig', 'cardSubType').setValue('standard')
          this.backUpRequestType = this.requestType
        } else {
          this.requestType = this.backUpRequestType
          this.pickerContentData = backUpPreSelected
        }
        if (goThrough) {
          if (this.requestType === 'KB' || this.requestType === 'Collections') {
            try {
              this.filterBy =
                Object.keys((this.getPath('request', 'searchV6').value.sort as any)[0])[0] ||
                'viewCount'
              const ids: string[] = (this.getPath('request', 'searchV6').value.filters as any)[0]
                .andFilters[0].collectionsId
              ids.map(v => (this.pickerContentData.preselected as Set<string>).add(v))
            } catch (_ex) {
              this.filterBy = 'viewCount'
            }
          } else if (this.requestType === 'ids' && this.getPath('request', 'ids').value) {
            this.getPath('request', 'ids').value.map((v: string) =>
              (this.pickerContentData.preselected as Set<string>).add(v),
            )
          }
        }
      })
    }
  }

  update(key: string, value: any) {
    const form = this.form.controls.request.get(key) as AbstractControl
    form.setValue(value)
  }

  onContentSelectionChanged(event: { content: Partial<NsContent.IContent>; checked: boolean }) {
    const lexIDs = JSON.parse(
      JSON.stringify((this.form.controls.request as FormGroup).controls.ids.value || []),
    )
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

  addPrePostWidgetEnd(type: 'pre' | 'post') {
    const preWidget = this.addPrePostWidgets()
    if (type === 'pre') {
      if (this.currentStrip.preWidgets) {
        this.currentStrip.preWidgets.push(preWidget)
      } else {
        this.currentStrip.preWidgets = [preWidget]
      }
      this.currPreWidget =
        this.currentStrip.preWidgets.length > 0 ? this.currentStrip.preWidgets.length - 1 : 0
    } else if (type === 'post') {
      if (this.currentStrip.postWidgets) {
        this.currentStrip.postWidgets.push(preWidget)
      } else {
        this.currentStrip.postWidgets = [preWidget]
      }
      this.currPostWidget =
        this.currentStrip.postWidgets.length > 1 ? this.currentStrip.postWidgets.length - 1 : 0
    }
  }

  addPrePostWidgetFront(type: 'pre' | 'post') {
    const preWidget = this.addPrePostWidgets()
    if (type === 'pre') {
      if (this.currentStrip.preWidgets) {
        this.currentStrip.preWidgets.unshift(preWidget)
      } else {
        this.currentStrip.preWidgets = [preWidget]
      }
      this.currPreWidget = 0
    } else if (type === 'post') {
      if (this.currentStrip.postWidgets) {
        this.currentStrip.postWidgets.unshift(preWidget)
      } else {
        this.currentStrip.postWidgets = [preWidget]
      }
      this.currPostWidget = 0
    }
  }

  addPrePostWidgets(): NsWidgetResolver.IRenderConfigWithTypedData<IWidgetElementHtml> {
    const preWidget: NsWidgetResolver.IRenderConfigWithTypedData<IWidgetElementHtml> = {
      widgetData: {
        html: '',
        template: '',
        templateData: {
          image: '',
          title: '',
        },
        containerStyle: {
          width: '262px',
        },
        containerClass: 'h-full',
      },
      widgetType: 'element',
      widgetSubType: 'elementHtml',
      widgetHostClass: 'mat-elevation-z4',
      widgetHostStyle: {},
      widgetInstanceId: '',
    }
    return preWidget

  }

  updatePrePost(
    data: NsWidgetResolver.IRenderConfigWithTypedData<IWidgetElementHtml>,
    type: 'pre' | 'post',
    index: number,
    doRemove = false,
  ) {
    const widgetType = type === 'pre' ? 'preWidgets' : 'postWidgets'
    const widget: NsWidgetResolver.IRenderConfigWithAnyData[] = this.currentStrip[widgetType] as any
    if (doRemove) {
      widget.splice(index, 1)
      let position = type === 'pre' ? this.currPreWidget : this.currPostWidget
      if (widget.length >= 1 && position !== 0) {
        position = position - 1
      }
      type === 'pre' ? (this.currPreWidget = position) : (this.currPostWidget = position)
    } else {
      widget[index].widgetData = data
    }
  }

  removeStrip() {
    this.content.strips.splice(this.index, 1)
    if (this.index >= this.content.strips.length && this.index === 0) {
      this.addEnd(false)
    } else if (this.index >= this.content.strips.length) {
      this.index = this.index - 1
      this.onIndexChange(this.index)
    } else {
      this.onIndexChange(this.index)
    }
  }

  addfront() {
    const strip = this.addStrip()
    this.content.strips.unshift(strip)
    this.currentStrip = strip
    this.index = 0
    this.onIndexChange(this.index)
  }

  addEnd(increaseIndex = true) {
    const strip = this.addStrip()
    this.content.strips.push(strip)
    this.currentStrip = strip
    this.index = increaseIndex ? this.content.strips.length - 1 : this.index
    this.onIndexChange(this.index)
  }

  addStrip(): NsContentStripMultiple.IContentStripUnit {
    const strip: NsContentStripMultiple.IContentStripUnit = {
      key: '',
      title: '',
      preWidgets: [] as any,
      postWidgets: [] as any,
      filters: [] as any,
      request: {
        search: undefined,
        searchV6: undefined,
        searchRegionRecommendation: undefined,
        ids: [],
        api: undefined,
      },
    }
    return strip
  }

  onIdChange(data: string[]) {
    this.getPath('request', 'ids').setValue(data)
    this.pickerContentData.preselected = new Set(data || []) as any
    this.pickerContentData = { ...this.pickerContentData }
  }

  onSearchV6Change(
    event?: { content: Partial<NsContent.IContent>; checked: boolean },
    ids?: string[],
    fromAuthChips = false,
  ) {
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
      if (
        searchBody &&
        searchBody.filters &&
        searchBody.filters[0] &&
        searchBody.filters[0].andFilters &&
        searchBody.filters[0].andFilters[0] &&
        searchBody.filters[0].andFilters[0].collectionsId &&
        searchBody.filters[0].andFilters[0].collectionsId.length
      ) {
        searchV6.filters[0].andFilters[0].collectionsId = [
          searchBody.filters[0].andFilters[0].collectionsId[0],
        ]
      } else {
        if (
          searchV6 &&
          searchV6.filters &&
          searchV6.filters[0].andFilters &&
          searchV6.filters[0].andFilters[0] &&
          searchV6.filters[0].andFilters[0].collectionsId
        ) {
          delete searchV6.filters[0].andFilters[0].collectionsId
        }
      }
    }
    if (this.keywords && this.keywords.length) {
      searchV6.filters[0].andFilters[0].keywords = this.keywords || []
    } else {
      if (
        searchV6 &&
        searchV6.filters &&
        searchV6.filters[0].andFilters &&
        searchV6.filters[0].andFilters[0] &&
        searchV6.filters[0].andFilters[0].keywords
      ) {
        delete searchV6.filters[0].andFilters[0].keywords
      }
    }
    if (
      searchV6 &&
      searchV6.filters &&
      searchV6.filters[0].andFilters &&
      !Object.keys(searchV6.filters[0].andFilters).length
    ) {
      delete searchV6.filters[0].andFilters
    }
    this.pickerContentData = { ...this.pickerContentData }
    this.getPath('request', 'searchV6').setValue(JSON.parse(JSON.stringify(searchV6)))
  }

  addSticky() {
    if (this.currentStrip.preWidgets) {
      const preWidget = this.currentStrip.preWidgets[this.currPreWidget]
      const widgetArray = (preWidget.widgetHostClass || '').split(' ')
      if (preWidget.widgetHostClass && preWidget.widgetHostClass.indexOf('sticky-m') > -1) {
        widgetArray.splice(widgetArray.indexOf('sticky-m'), 1)
      } else {
        widgetArray.push('sticky-m')
      }
      preWidget.widgetHostClass = widgetArray.join(' ')
    }
  }

  onCardChange() {
    this.getPath('stripConfig', 'cardSubType').setValue(this.cardSubtype)
  }
}
