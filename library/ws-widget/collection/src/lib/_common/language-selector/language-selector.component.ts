import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { ConfigurationsService, NsInstanceConfig } from '../../../../../utils/src/public-api'
import { MatSelectChange } from '@angular/material'

@Component({
  selector: 'ws-widget-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
})
export class LanguageSelectorComponent implements OnInit {
  allowedLangCode: { [langCode: string]: NsInstanceConfig.ILocalsConfig } = {}
  appLanguage = ''
  chosenLanguage = ''
  @Output() langChangedEvent = new EventEmitter<string>()

  constructor(private configSvc: ConfigurationsService) { }

  ngOnInit() {
    const instanceConfig = this.configSvc.instanceConfig
    this.appLanguage = (this.configSvc.activeLocale && this.configSvc.activeLocale.path) || ''
    if (this.appLanguage === '') {
      this.appLanguage = 'en'
    }
    this.chosenLanguage = this.appLanguage
    if (instanceConfig) {

      this.allowedLangCode = instanceConfig.locals.reduce(
        (agg: { [path: string]: NsInstanceConfig.ILocalsConfig }, u) => {
          agg[u.path] = u
          return agg
        },
        {},
      )
    }
  }

  langChanged(path: MatSelectChange) {
    this.chosenLanguage = path.value
    this.langChangedEvent.emit(path.value)
  }

  isLocaleAvailable(langPath: string): boolean {
    // this.loggerSvc.log('Locale', this.allowedLangCode[langPath].isAvailable)
    return this.allowedLangCode[langPath] && this.allowedLangCode[langPath].isAvailable
  }
  isLocaleEnabled(langPath: string): boolean {
    return this.allowedLangCode[langPath] && this.allowedLangCode[langPath].isEnabled
  }

}
