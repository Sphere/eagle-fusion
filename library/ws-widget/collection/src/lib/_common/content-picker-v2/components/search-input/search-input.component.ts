import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core'
import { FormControl } from '@angular/forms'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { WidgetContentService } from '../../../../_services/widget-content.service'
import { ConfigurationsService } from '@ws-widget/utils'
import { SearchServService } from '@ws/app/src/lib/routes/search/services/search-serv.service'
import { Subscription } from 'rxjs'

interface ISearchQuery {
  lang: string
  query: string
}
@Component({
  selector: 'ws-widget-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
})
export class SearchInputComponent implements OnInit, OnDestroy {

  @Output()
  searchRequest = new EventEmitter<ISearchQuery>()

  searchControl = new FormControl('')
  selectedLang: string
  availableLanguages: string[] = []
  searchControlSubscription: Subscription | null = null
  fetchConfigSubscription: Subscription | null = null

  constructor(
    private widgetContentSvc: WidgetContentService,
    private configSvc: ConfigurationsService,
    private searchServSvc: SearchServService,
  ) {
    this.selectedLang = this.searchServSvc.getLanguageSearchIndex(
      this.configSvc.activeLocale && this.configSvc.activeLocale.locals[0] || 'en'
    )
  }

  getSearchConfig() {
    const url = `${this.configSvc.sitePath}/feature/search.json`
    this.widgetContentSvc.fetchConfig(url).subscribe(
      config => {
        this.availableLanguages = config.search.languageSearch.map((locale: string) => locale.toLowerCase())
      },
      _err => { })
  }

  changeLang(lang: string) {
    this.selectedLang = lang
    this.emitSearchEvent()
  }

  emitSearchEvent() {
    this.searchRequest.emit({ query: this.searchControl.value, lang: this.selectedLang })
  }

  ngOnInit() {
    this.getSearchConfig()
    this.searchControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(() => {
      this.emitSearchEvent()
    })
  }

  ngOnDestroy() {
    if (this.fetchConfigSubscription) {
      this.fetchConfigSubscription.unsubscribe()
    }
    if (this.searchControlSubscription) {
      this.searchControlSubscription.unsubscribe()
    }
  }

}
