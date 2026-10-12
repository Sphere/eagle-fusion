import { Component, OnInit, ViewEncapsulation } from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfigurationsService, LoggerService, NsPage } from '@ws-widget/utils'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { ISearchAutoComplete, ISearchQuery, ISuggestedFilters } from '../../models/search.model'
import { SearchServService } from '../../services/search-serv.service'
import { SearchApiService } from '@ws/app/src/lib/routes/search/apis/search-api.service'
import { LanguageService } from 'src/app/services/language.service'

@Component({
  standalone: false,
  selector: 'ws-app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  // tslint:disable-next-line
  encapsulation: ViewEncapsulation.None,

})
export class HomeComponent implements OnInit {

  query: UntypedFormControl = new UntypedFormControl('')
  lang = ''
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  autoCompleteResults: ISearchAutoComplete[] = []
  searchQuery: ISearchQuery = {
    l: this.getActivateLocale(),
    q: '',
  }
  languageSearch: string[] = []
  suggestedFilters: ISuggestedFilters[] = []
  contact = ''
  isAutoCompleteAllowed: boolean | undefined
  constructor(
    private readonly configSvc: ConfigurationsService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly searchSvc: SearchServService,
    private readonly searchApi: SearchApiService,
    private readonly languageSvc: LanguageService,
    private readonly logger: LoggerService
  ) {
    this.isAutoCompleteAllowed = this.route.snapshot.data.pageData.data.search.isAutoCompleteAllowed
  }

  search(query?: string, lang?: string) {
    this.logger.log(lang, query)
    this.logger.log(this.searchQuery.l)
    // Only forward a lang param when the user actually picked one (via selectLang/the
    // language menu, which sets this.lang) - searchQuery.l defaults to getActivateLocale()
    // on init even when the user never touched the language selector, and forwarding that
    // default here meant every search silently got a language filter nobody chose.
    const lang1 = lang || this.lang || undefined
    const homeQueryParams: { q: string; lang?: string } = { q: query || this.searchQuery.q }
    const learningQueryParams: { q: string; lang?: string; f: string } = {
      q: query || this.searchQuery.q,
      f: JSON.stringify({ contentType: ['Course'] }),
    }
    if (lang1) {
      homeQueryParams.lang = lang1
      learningQueryParams.lang = lang1
    }
    this.router.navigate(['/app/search/home'], {
      queryParams: homeQueryParams,
    }).then(() => {
      this.router.navigate(['/app/search/learning'], {
        queryParams: learningQueryParams,
      })
    })
  }
  selectLang(e: any) {
    this.lang = e
    this.router.navigate(['/app/search/home'], {
      queryParams: { lang: e, q: this.searchQuery.q },
    }).then(() => {
      this.router.navigate(['/app/search/home'], {
        queryParams: {
          q: this.searchQuery.q,
          lang: e,
          f: JSON.stringify({ contentType: ['Course'] }),
        },
      })
    })
  }
  searchWithFilter(filter: any): void {
    const objType = filter.contentType ? { contentType: [filter.contentType] } :
      filter.resourceType ? { resourceType: [filter.resourceType] } : filter.combinedType === 'learningContent' ?
        { contentType: ['Collection', 'Learning Path', 'Course'] } : ''
    // Same rule as search(): only forward lang when the user actually selected one.
    const homeQueryParams: { q: string; lang?: string } = { q: this.searchQuery.q }
    const learningQueryParams: { q: string; lang?: string; f: string } = {
      q: this.searchQuery.q,
      f: JSON.stringify(objType),
    }
    if (this.lang) {
      homeQueryParams.lang = this.lang
      learningQueryParams.lang = this.lang
    }
    this.router.navigate(['/app/search/home'], {
      queryParams: homeQueryParams,
    }).then(() => {
      this.router.navigate(['/app/search/learning'], {
        queryParams: learningQueryParams,
      })
    })
  }

  getActivateLocale(): string {
    this.logger.log(this.configSvc)
    // Use LanguageService instead of checking location.href
    const locale = (this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : this.languageSvc.getCurrentLanguage()
    this.logger.log(locale, 'homecompo')
    // (this.configSvc.unMappedUser.profileDetails?.preferences?.language) || 'en'
    // return this.searchSvc.getLanguageSearchIndex(locale)
    return locale
  }

  get preferredLanguages(): string | null {
    if (this.configSvc.userPreference && this.configSvc.userPreference.selectedLangGroup) {
      let prefLang: string[] | string = this.configSvc.userPreference.selectedLangGroup.split(',').map(lang => {
        return this.searchSvc.getLanguageSearchIndex(lang || 'en')
      })
      prefLang = prefLang.join(',')
      return prefLang
    }
    return null
  }

  swapRemove(langArray: string[], from: number, to: number) {
    langArray.splice(to, 0, langArray[from])
    langArray.splice(from + 1, 1)
  }

  getAutoCompleteResults(): void {
    this.logger.log('888')
    this.searchSvc.searchAutoComplete(this.searchQuery).then((results: ISearchAutoComplete[]) => {
      this.autoCompleteResults = results
    }).catch(() => {

    })
  }

  searchLanguage(lang: string): void {
    this.router.navigate([], {
      queryParams: { lang, q: this.searchQuery.q },
      queryParamsHandling: 'merge',
      relativeTo: this.route.parent,
    }).then(() => {
      this.getAutoCompleteResults()
    })
  }

  langSelect(lang: string) {
    this.lang = lang
  }

  ngOnInit() {
    if (typeof this.isAutoCompleteAllowed === 'undefined' ||
      (typeof this.isAutoCompleteAllowed === 'boolean' && this.isAutoCompleteAllowed)) {
      this.query.valueChanges.pipe(
        debounceTime(200),
        distinctUntilChanged(),
      ).subscribe(q => {
        this.searchQuery.q = q
        this.logger.log(q)
      })
    }
    this.searchApi.currentMessage.subscribe(
      (data: any) => {
        if (data) {
          this.search()
        }
      })
    this.route.queryParamMap.subscribe(queryParam => {
      if (queryParam.has('q')) {
        this.searchQuery.q = queryParam.get('q') || ''
      } else {
        this.searchQuery.q = ''
      }
      this.query.setValue(this.searchQuery.q)
      if (queryParam.has('lang')) {
        this.searchQuery.l = queryParam.get('lang') || this.getActivateLocale()
      } else {
        this.searchQuery.l = this.getActivateLocale()
      }
      this.languageSearch = this.route.snapshot.data.pageData.data.search.languageSearch.map(
        (u: string) => u.toLowerCase(),
      )
      this.languageSearch = this.languageSearch.sort((a: string, b: string) => a.localeCompare(b))
      this.swapRemove(this.languageSearch, this.languageSearch.indexOf('all'), 0)
      if (this.preferredLanguages && this.preferredLanguages.split(',').length > 1) {
        this.languageSearch.splice(1, 0, this.preferredLanguages)
      }
    })
    this.searchSvc.getSearchConfig().then(res => {
      this.suggestedFilters = res.search && res.search.suggestedFilters

    })
  }

}
