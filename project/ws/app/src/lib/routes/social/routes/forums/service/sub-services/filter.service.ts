import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'
const API_END_POINTS = {
  translateFiltersBase: '/apis/protected/v8/translate/filterdata',
  translateFilters: (lang: string) => `${API_END_POINTS.translateFiltersBase}/${lang}`,
}
@Injectable({
  providedIn: 'root',
})
export class FilterService {

  constructor(
    private http: HttpClient,
  ) { }
  get defaultFiltersTranslated() {
    return { en: {}, all: {} }
  }
  async translateSearchFilters(lang: string): Promise<any> {
    const filtersTranslation = JSON.parse(localStorage.getItem('filtersTranslation') || JSON.stringify(this.defaultFiltersTranslated))
    if (lang.split(',').length === 1) {
      if (!filtersTranslation.hasOwnProperty(lang)) {
        filtersTranslation[lang] = {}
        localStorage.setItem('filtersTranslation', JSON.stringify(filtersTranslation))
        filtersTranslation[lang] = await this.http.get(API_END_POINTS.translateFilters(lang)).toPromise()
        localStorage.setItem('filtersTranslation', JSON.stringify(filtersTranslation))
      }
      return of(filtersTranslation[lang]).toPromise()
    }
    return of(filtersTranslation['en'] || {}).toPromise()

  }

}
