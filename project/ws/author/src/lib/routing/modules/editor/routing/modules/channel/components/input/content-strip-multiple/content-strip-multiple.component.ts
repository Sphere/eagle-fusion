import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'

import { NsContentStripMultiple, IPickerContentData, NsContent } from '@ws-widget/collection/src/public-api'

@Component({
  selector: 'ws-auth-content-strip-multiple',
  templateUrl: './content-strip-multiple.component.html',
  styleUrls: ['./content-strip-multiple.component.scss'],
})
export class ContentStripMultipleComponent implements OnInit {

  @Input() isSubmitPressed = false
  @Input() identifier = ''
  @Input() content!: NsContentStripMultiple.IContentStripUnit
  @Output() data = new EventEmitter<{ content: NsContentStripMultiple.IContentStripUnit, isValid: boolean }>()
  form!: FormGroup
  requestType!: 'search' | 'api' | 'ids' | 'searchRegionRecommendation' | 'searchV6'
  isAddingContent = false
  selectedContentIds: Set<string> = new Set()
  pickerContentData!: IPickerContentData
  subscription: any
  dataType = 'authoring'
  id = 0

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.pickerContentData = {
      preselected: new Set(),
      enablePreselected: true,
      availableFilters: ['contentType', 'learningMode',
        'region', 'resourceType',
        'duration', 'sourceShortName', 'catalogPaths',
        'complexityLevel', 'concepts', 'lastUpdatedOn'],
    }
    if (this.content.request && this.content.request.ids && this.content.request.ids.length) {
      this.content.request.ids.map(
        v => (this.pickerContentData.preselected as Set<string>).add(v))
    }
    if (this.content.request) {
      if (this.content.request.searchV6) {
        this.requestType = 'searchV6'
      } else if (this.content.request.search) {
        this.requestType = 'search'
      } else if (this.content.request.api) {
        this.requestType = 'api'
      } else if (this.content.request.searchRegionRecommendation) {
        this.requestType = 'searchRegionRecommendation'
      } else {
        this.requestType = 'ids'
      }
    }
    this.form = this.formBuilder.group({
      key: [this.content ? this.content.key || this.getUniqueId() : this.getUniqueId()],
      title: [this.content ? this.content.title || '' : ''],
      loader: [this.content ? this.content.loader : false],
      filters: [this.content.filters || {}],
      stripConfig: this.formBuilder.group({
        cardSubType: [this.content.stripConfig ? this.content.stripConfig.cardSubType || 'standard' : 'standard'],
        intranetMode: this.content.stripConfig && this.content.stripConfig.intranetMode,
        deletedMode: this.content.stripConfig && this.content.stripConfig.deletedMode,
        postCardForSearch: [this.content.stripConfig ? this.content.stripConfig.postCardForSearch || false : false],
      }),
      request: this.formBuilder.group({
        search: [this.content.request ? this.content.request.search : ''],
        api: [this.content.request ? this.content.request.api : {}],
        ids: [this.content.request ? this.content.request.ids : ''],
      }),
    })

    this.subscription = (this.form.controls.request.get('ids') as AbstractControl).valueChanges.subscribe({
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

    this.form.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
      ).subscribe({
        next: () => {
          this.data.emit({
            content: this.form.value,
            isValid: this.form.valid,
          })
        },
      })
  }

  private getUniqueId(): string {
    this.id += 1
    return (new Date().getTime() + this.id).toString()
  }

  update(key: string, value: any) {
    (this.form.controls.request.get(key) as AbstractControl).setValue(value)
  }

  onContentSelectionChanged(event: { content: Partial<NsContent.IContent>, checked: boolean }) {
    const lexIDs = (this.form.controls.request as FormGroup).controls.ids.value || []
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
    (this.form.controls.request as FormGroup).controls.ids.setValue(lexIDs)
  }
}
