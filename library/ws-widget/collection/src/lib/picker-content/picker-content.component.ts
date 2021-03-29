import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils'
import { SearchServService } from '@ws/app/src/lib/routes/search/services/search-serv.service'
import { BehaviorSubject, EMPTY, Subscription, timer } from 'rxjs'
import { debounce, mergeMap } from 'rxjs/operators'
import { NsContent } from '../_services/widget-content.model'
import { NSSearch } from '../_services/widget-search.model'
import { IPickerContentData, ISearchConfig } from './picker-content.model'
import { PickerContentService } from './picker-content.service'

@Component({
  selector: 'ws-widget-picker-content[widgetData]',
  templateUrl: './picker-content.component.html',
  styleUrls: ['./picker-content.component.scss'],
})
export class PickerContentComponent extends WidgetBaseComponent
  implements OnInit, OnChanges, OnDestroy, NsWidgetResolver.IWidgetData<IPickerContentData> {
  allowContentTypes = ['Resource', 'Course', 'Learning Path', 'Module']
  @ViewChild('removeSubset', { static: true })
  errorRemoveSubsetMessage!: ElementRef<any>
  @Input() selectionType: 'radio' | 'checkbox' = 'checkbox'
  @Input() content = ''
  @Input() widgetData!: IPickerContentData
  @Input() removeSubset = false
  @Output()
  change = new EventEmitter<{
    checked: boolean
    content: Partial<NsContent.IContent>
  }>()

  @Output()
  suggestedDurationChange = new EventEmitter<number>()

  @Input() dataType: 'authoring' | '' = ''
  @Input() showFilter = true
  @Input() customSearchFilters!: any
  query = ''
  language = (this.configSvc.activeLocale && this.configSvc.activeLocale.locals[0]) || 'en'
  availableLanguages: string[] = []
  @Input() selectedContentTypes = NsContent.PLAYLIST_SUPPORTED_CONTENT_TYPES

  selectedContentIds = new Set<string>()
  displayFilters: NSSearch.IFilterUnitResponse[] | null = null

  searchFetchStatus: TFetchStatus = 'none'
  searchResults: NsContent.IContent[] = []

  debounceSubject = new BehaviorSubject<boolean>(false)
  debounceSubscription: Subscription | null = null

  defaultThumbnail = ''
  @Input() searchableContentTypes = NsContent.PLAYLIST_SUPPORTED_CONTENT_TYPES
  @Input() appContentTypes = NsContent.EContentTypes
  preSelected = new Set()
  constructor(
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
    private pickerContentSvc: PickerContentService,
    private searchServSvc: SearchServService,
  ) {
    super()
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
    }
  }

  getAvailableLanguages() {
    this.pickerContentSvc.getSearchConfigs().then((data: ISearchConfig) => {
      this.availableLanguages = data.search.languageSearch.map((u: string) => u.toLowerCase())
    })
  }

  setCurrentLanguage(lang: string) {
    this.language = lang
    this.initializeSearchSubject()
  }

  ngOnInit() {
    this.initializeSearchSubject()
    this.preSelected = new Set(Array.from(this.widgetData.preselected || new Set()))
    this.getAvailableLanguages()
  }

  ngOnChanges() {
    if (this.widgetData.preselected) {
      this.selectedContentIds = new Set([...this.widgetData.preselected])
    }
  }

  async initializeSearchSubject(phraseSearch: boolean = true) {
    const phraseSearchConfig = await this.searchServSvc.getApplyPhraseSearch()
    const searchConfig = await this.searchServSvc.getSearchConfig()
    const isStandAlone = searchConfig.search.tabs[0].isStandAlone
    // let applyIsStandAlone = false
    if (isStandAlone || isStandAlone === undefined) {
      // applyIsStandAlone = true
    }
    this.debounceSubscription = this.debounceSubject
      .pipe(
        debounce(shouldDebounce => (shouldDebounce ? timer(500) : EMPTY)),
        mergeMap(() => {
          this.searchFetchStatus = 'fetching'
          this.searchResults = []
          let query = this.query || '*'
          if (phraseSearch && query.indexOf(' ') > -1 && phraseSearchConfig) {
            query = `"${query}"`
          }
          // tslint:disable-next-line: max-line-length
          return this.searchServSvc.searchV6Wrapper({ request: { query, filters: { visibility: ['Default'] }, sort_by: { lastUpdatedOn: 'desc' }, fields: [], facets: [] } })

        }),
      )
      .subscribe(
        (search: any) => {
          if (phraseSearch && search.totalHits === 0 && phraseSearchConfig) {
            return this.initializeSearchSubject(false)
          }
          this.searchFetchStatus = 'done'
          this.searchResults = search.result
          this.searchResults.forEach(content => {
            if (this.widgetData.chipNamesHash) {
              this.widgetData.chipNamesHash[content.identifier] = content.name
            }
          })
          const availableFilters = this.widgetData.availableFilters || ['contentType']
          if (!this.displayFilters && availableFilters) {
            this.displayFilters = search.filters.filter((filter: any) =>
              availableFilters.includes(filter.type),
            )
            if (this.displayFilters) {
              const contentTypes = this.displayFilters.find((filter: any) => filter.type === 'contentType')
              if (contentTypes) {
                contentTypes.content = contentTypes.content.filter(type =>
                  this.allowContentTypes.includes(type.type || ''),
                )
              }
            }
          }
          return
        },
        () => {
          this.searchFetchStatus = 'error'
        },
      )
  }

  selectedContentChanged(identifier: string, checked: boolean) {
    const contentMeta = this.searchResults.find(content => content.identifier === identifier)
    if (checked) {
      if (this.selectionType === 'checkbox') {
        this.selectedContentIds.add(identifier)
        if (this.removeSubset) {
          this.pickerContentSvc
            .removeSubset(Array.from(this.selectedContentIds))
            .subscribe(response => {
              if (response.goal_message && response.goal_message.length) {
                this.change.emit({
                  checked: false,
                  content: contentMeta ? contentMeta : { identifier },
                })
                this.snackBar.open(response.goal_message[0])
              }
              this.suggestedDurationChange.emit(response.suggested_time)
              this.selectedContentIds = new Set(response.resource_list)
            })
        }
      } else {
        this.selectedContentIds = new Set([identifier])
      }
    } else {
      this.selectedContentIds.delete(identifier)
    }
    this.change.emit({
      checked,
      content: contentMeta ? contentMeta : { identifier },
    })
  }

  filterChanged(item: NsContent.EContentTypes, checked: boolean) {
    if (checked) {
      this.selectedContentTypes.push(item)
    } else {
      this.selectedContentTypes = this.selectedContentTypes.filter(
        contentType => contentType !== item,
      )
    }
    this.debounceSubject.next(false)
  }

  ngOnDestroy() {
    if (this.debounceSubscription) {
      this.debounceSubscription.unsubscribe()
    }
  }
}
