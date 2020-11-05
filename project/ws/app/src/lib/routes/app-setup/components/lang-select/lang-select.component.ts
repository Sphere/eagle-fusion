import { Router } from '@angular/router'
import { Component, OnInit } from '@angular/core'
import {
  ConfigurationsService,
  NsInstanceConfig,
  UserPreferenceService,
} from '../../../../../../../../../library/ws-widget/utils/src/public-api'
import { FormControl, Validators } from '@angular/forms'

@Component({
  selector: 'ws-app-lang-select',
  templateUrl: './lang-select.component.html',
  styleUrls: ['./lang-select.component.scss'],
})
export class LangSelectComponent implements OnInit {
  constructor(
    private configSvc: ConfigurationsService,
    private router: Router,
    private userPrefSvc: UserPreferenceService,
  ) {}
  userName = ''
  selectedLang = ''
  lang = ''
  animalControl = new FormControl('', Validators.required)
  allowedLangCode: { [langCode: string]: NsInstanceConfig.ILocalsConfig } = {}

  ngOnInit() {
    if (this.configSvc.userProfile) {
      this.userName = this.configSvc.userProfile.givenName || ''
    }
    this.selectedLang = ''
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.allowedLangCode = instanceConfig.locals.reduce(
        (agg: { [path: string]: NsInstanceConfig.ILocalsConfig }, u) => {
          agg[u.path] = u
          return agg
        },
        {},
      )
    }
    // this.getUsersLocale('en')
  }

  // async getUsersLocale(defaultValue: string) {
  //   // if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
  //   //   return defaultValue
  //   // }
  //   const wn = window.navigator as any
  //   this.lang = wn.languages ? wn.languages[0] : defaultValue
  //   this.lang = this.lang || wn.language || wn.browserLanguage || wn.userLanguage
  //   Object.keys(this.allowedLangCode).forEach(async langCode => {

  //     if (!langCode) {
  //       langCode = 'en'
  //     }
  //     if (langCode.split('-')[0] === this.lang.split('-')[0]) {
  //       if (this.configSvc.userPreference && this.configSvc.userPreference.selectedLocale !== this.lang) {
  //         console.log('seleced: ', this.configSvc.userPreference.selectedLocale)
  //         console.log('Geo: ', this.lang)
  //         await this.userPrefSvc.saveUserPreference({
  //           selectedLocale: this.lang,
  //         })
  //         if (this.lang === 'en') {
  //           this.lang = ''
  //         } else {
  //           this.lang += '/'
  //         }
  //         location.assign(`${location.origin}/${this.lang}${this.router.url.substring(1)}`)

  //       }
  //     }
  //   })

  // }

  isLocaleAvailable(langPath: string): boolean {
    // this.loggerSvc.log('Locale', this.allowedLangCode[langPath].isAvailable)
    return this.allowedLangCode[langPath] && this.allowedLangCode[langPath].isAvailable
  }
  isLocaleEnabled(langPath: string): boolean {
    return this.allowedLangCode[langPath] && this.allowedLangCode[langPath].isEnabled
  }

  langChanged(path: string) {
    this.selectedLang = path
  }

  async applyLang() {
    if (this.selectedLang === 'en') {
      this.selectedLang = ''
    }
    await this.userPrefSvc.saveUserPreference({
      selectedLocale: this.selectedLang,
    })

    let refAppend = ''
    if (this.configSvc.userUrl) {
      refAppend = `?ref=${encodeURIComponent(this.configSvc.userUrl)}`
    }
    this.selectedLang === ''
      ? this.router.navigateByUrl('/app/setup/home/tnc')
      : location.assign(`${location.origin}/${this.selectedLang}/app/setup/home/tnc${refAppend}`)
  }
}
