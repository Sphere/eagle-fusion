import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, ViewChild, ViewEncapsulation } from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfigurationsService } from '@ws-widget/utils/src/public-api'
import { Observable } from 'rxjs'
import { debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs/operators'
import { ISearchAutoComplete } from '../../models/search.model'
import { SearchServService } from '../../services/search-serv.service'

@Component({
  selector: 'ws-app-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
  // tslint:disable-next-line
  encapsulation: ViewEncapsulation.None,
})
export class SearchInputComponent implements OnInit, OnChanges {
  @Input() placeHolder = ''
  @Input() ref = ''
  @Output() closed: EventEmitter<boolean> = new EventEmitter()
  queryControl = new UntypedFormControl(this.activated.snapshot.queryParams.q || 'all')
  languageSearch: string[] = []
  filteredOptions$: Observable<string[]> = this.queryControl.valueChanges.pipe(
    startWith(this.queryControl.value),
    debounceTime(500),
    distinctUntilChanged(),
    switchMap(() => []),
  )
  @ViewChild('searchInput', { static: false }) searchInputElem: ElementRef<any> = {} as ElementRef<
    any
  >
  autoCompleteResults: ISearchAutoComplete[] = []
  searchLocale = this.getActiveLocale()
  lang = ''

  constructor(
    private activated: ActivatedRoute,
    private router: Router,
    private searchServSvc: SearchServService,
    private configSvc: ConfigurationsService,
    private route: ActivatedRoute,
  ) {
    const isAutoCompleteAllowed = this.route.snapshot.data.searchPageData.data.search.isAutoCompleteAllowed
    if (typeof isAutoCompleteAllowed === 'undefined' ||
      (typeof isAutoCompleteAllowed === 'boolean' && isAutoCompleteAllowed)) {
      this.queryControl.valueChanges.pipe(
        debounceTime(200),
        distinctUntilChanged(),
      ).subscribe(q => {
        this.getSearchAutoCompleteResults(q)
      })
    }
  }

  ngOnInit() {
    if (this.searchInputElem.nativeElement) {
      this.searchInputElem.nativeElement.activated()
    }
    this.activated.queryParamMap.subscribe(queryParam => {
      if (queryParam.has('q')) {
        this.queryControl.setValue(queryParam.get('q') || 'all')
      } else {
        this.updateQuery('all')
      }
      if (queryParam.has('lang')) {
        this.searchLocale = queryParam.get('lang') || this.getActiveLocale()
      } else {
        this.searchLocale = this.getActiveLocale()
      }
      const isAutoCompleteAllowed = this.route.snapshot.data.searchPageData.data.search.isAutoCompleteAllowed
      if (typeof isAutoCompleteAllowed === 'undefined' ||
        (typeof isAutoCompleteAllowed === 'boolean' && isAutoCompleteAllowed)) {
        this.getSearchAutoCompleteResults(this.queryControl.value)
      }
    })
    this.languageSearch = this.route.snapshot.data.searchPageData.data.search.languageSearch.map(
      (u: string) => u.toLowerCase(),
    )
    this.languageSearch = this.languageSearch.sort()
    this.swapRemove(this.languageSearch, this.languageSearch.indexOf('all'), 0)
    if (this.preferredLanguages && this.preferredLanguages.split(',').length > 1) {
      this.languageSearch.splice(1, 0, this.preferredLanguages)
    }
  }
  ngOnChanges() {
    for (const change in SimpleChange) {
      if (change === 'placeHolder') {
        this.placeHolder = this.placeHolder
      }
    }
  }

  swapRemove(langArray: string[], from: number, to: number) {
    langArray.splice(to, 0, langArray[from])
    langArray.splice(from + 1, 1)
  }

  getActiveLocale(): string {
    const locale = (this.configSvc.activeLocale && this.configSvc.activeLocale.locals[0]) || 'en'
    return this.searchServSvc.getLanguageSearchIndex(locale)
  }

  get preferredLanguages(): string | null {
    if (this.configSvc.userPreference && this.configSvc.userPreference.selectedLangGroup) {
      let prefLang: string[] | string = this.configSvc.userPreference.selectedLangGroup.split(',').map(lang => {
        return this.searchServSvc.getLanguageSearchIndex(lang || 'en')
      })
      prefLang = prefLang.join(',')
      return prefLang
    }
    return null
  }

  updateQuery(query: string) {
    if (this.searchInputElem && this.searchInputElem.nativeElement) {
      this.searchInputElem.nativeElement.blur()
    }
    if (this.ref === 'home') {
      this.closed.emit(false)
      this.router.navigate(['/app/search'], {
        queryParams: { q: query.trim() },
        queryParamsHandling: 'merge',
      })
    } else {
      this.router.navigate([], {
        relativeTo: this.activated.parent,
        queryParams: { q: query.trim() },
        queryParamsHandling: 'merge',
      })
    }
  }

  getSearchAutoCompleteResults(q: string) {
    if (this.searchLocale.split(',').length === 1) {
      this.searchServSvc.searchAutoComplete({
        q,
        l: this.searchLocale,
      }).then((result: ISearchAutoComplete[]) => {
        this.autoCompleteResults = result
      }).catch(() => { })
    }
  }

  searchLanguage(lang: string) {
    this.router.navigate([], {
      relativeTo: this.activated.parent,
      queryParams: { lang, q: this.queryControl.value },
      queryParamsHandling: 'merge',
    })
  }
}
