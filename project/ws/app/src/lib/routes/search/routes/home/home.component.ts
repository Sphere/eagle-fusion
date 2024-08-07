import { Component, OnInit, ViewEncapsulation } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfigurationsService, NsPage } from '@ws-widget/utils'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { ISearchAutoComplete, ISearchQuery, ISuggestedFilters } from '../../models/search.model'
import { SearchServService } from '../../services/search-serv.service'
import { SearchApiService } from '@ws/app/src/lib/routes/search/apis/search-api.service'

@Component({
  selector: 'ws-app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  // tslint:disable-next-line
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {

  query: FormControl = new FormControl('')
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
  constructor(
    private configSvc: ConfigurationsService,
    private router: Router,
    private route: ActivatedRoute,
    private searchSvc: SearchServService,
    private searchApi: SearchApiService
  ) {
    const isAutoCompleteAllowed = this.route.snapshot.data.pageData.data.search.isAutoCompleteAllowed
    if (typeof isAutoCompleteAllowed === 'undefined' ||
      (typeof isAutoCompleteAllowed === 'boolean' && isAutoCompleteAllowed)) {
      this.query.valueChanges.pipe(
        debounceTime(200),
        distinctUntilChanged(),
      ).subscribe(q => {
        this.searchQuery.q = q
        console.log(q)
        // this.getAutoCompleteResults()
      })
    }
    this.searchApi.currentMessage.subscribe(
      (data: any) => {
        if (data) {
          this.search()
        }
      })
  }

  search(query?: string, lang?: string) {
    console.log(lang, query)
    console.log(this.searchQuery.l)
    let url = window.location.href

    // Extract the query parameters part of the URL
    let paramsString = url.split('?')[1] || ''
    let params = new URLSearchParams(paramsString)

    let lang1 = '' // Default value
    // Check if 'lang' parameter exists
    if (params.has('lang')) {
      lang1 = params.get('lang') || ''
    }
    this.router.navigate(['/app/search/home'], {
      queryParams: { lang1, q: query || this.searchQuery.q },
    }).then(() => {
      this.router.navigate(['/app/search/learning'], {
        queryParams: {
          q: query || this.searchQuery.q,
          lang: lang1,
          f: JSON.stringify({ contentType: ['Course'] }),
        },
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
    this.router.navigate(['/app/search/home'], {
      queryParams: { lang: this.searchQuery.l, q: this.searchQuery.q },
    }).then(() => {
      this.router.navigate(['/app/search/learning'], {
        queryParams: {
          q: this.searchQuery.q,
          lang: this.searchQuery.l,
          f: JSON.stringify(objType),
        },
      })
    })
  }

  getActivateLocale(): string {
    console.log(this.configSvc)
    const locale = (this.configSvc.unMappedUser!.profileDetails && this.configSvc.unMappedUser!.profileDetails!.preferences && this.configSvc.unMappedUser!.profileDetails!.preferences!.language !== undefined) ? this.configSvc.unMappedUser.profileDetails.preferences.language : location.href.includes('/hi/') ? 'hi' : undefined
    console.log(locale, 'homecompo')
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
    console.log('888')
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
      this.languageSearch = this.languageSearch.sort()
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
