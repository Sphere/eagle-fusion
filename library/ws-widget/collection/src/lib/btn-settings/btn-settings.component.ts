import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { ConfigurationsService, NsInstanceConfig } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { BtnSettingsService } from './btn-settings.service'

@Component({
  selector: 'ws-widget-btn-settings',
  templateUrl: './btn-settings.component.html',
  styleUrls: ['./btn-settings.component.scss'],
})
export class BtnSettingsComponent extends WidgetBaseComponent
  implements OnInit, OnDestroy, NsWidgetResolver.IWidgetData<any> {
  constructor(private configSvc: ConfigurationsService, private settingsSvc: BtnSettingsService) {
    super()
  }
  @Input() widgetData!: any
  themes: NsInstanceConfig.ITheme[] = []
  fonts: NsInstanceConfig.IFontSize[] = []
  allowedLangCode: { [langCode: string]: NsInstanceConfig.ILocalsConfig } = {}

  darkModeForm = new FormControl(false)
  isRTLForm = new FormControl(this.configSvc.isRTL)
  activeThemeClass = ''
  activeFontClass = ''
  // Subscriptions
  modeChangeSubs: Subscription | null = null
  dirChangeSubs: Subscription | null = null
  prefChangeSubs: Subscription | null = null

  isLanguageEnabled = true

  ngOnInit() {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.themes = instanceConfig.themes
      this.fonts = instanceConfig.fontSizes
      this.fonts.sort((a, b) => a.scale - b.scale)
      this.isLanguageEnabled = instanceConfig.locals.length > 1
      this.allowedLangCode = instanceConfig.locals.reduce(
        (agg: { [path: string]: NsInstanceConfig.ILocalsConfig }, u) => {
          agg[u.path] = u
          return agg
        },
        {},
      )
      // Set the initial value for Themes
      this.darkModeForm.setValue(this.configSvc.isDarkMode)
      this.updateActiveStatus()
      // Events Subscription
      this.modeChangeSubs = this.darkModeForm.valueChanges
        .pipe(
          distinctUntilChanged(),
          debounceTime(150),
        )
        .subscribe((isDark: boolean) => {
          this.settingsSvc.applyThemeMode(isDark)
        })

      this.dirChangeSubs = this.isRTLForm.valueChanges
        .pipe(
          distinctUntilChanged(),
          debounceTime(150),
        )
        .subscribe((isRTL: boolean) => {
          this.settingsSvc.toggleRTL(isRTL)
        })
      this.prefChangeSubs = this.configSvc.prefChangeNotifier
        .pipe(debounceTime(100))
        .subscribe(() => {
          this.updateActiveStatus()
        })
    }
  }

  ngOnDestroy() {
    if (this.modeChangeSubs) {
      this.modeChangeSubs.unsubscribe()
    }
    if (this.prefChangeSubs) {
      this.prefChangeSubs.unsubscribe()
    }
    if (this.dirChangeSubs) {
      this.dirChangeSubs.unsubscribe()
    }
  }
  toggleRTL() {
    this.isRTLForm.setValue(!this.isRTLForm.value)
  }
  // change font
  changeFont(fontClass: string) {
    this.settingsSvc.changeFont(fontClass)
  }
  // Change theme
  changeTheme(themeClass: string) {
    this.settingsSvc.changeTheme(themeClass)
  }

  // Locale related helper methods
  isLocaleEnabled(langPath: string): boolean {
    return this.allowedLangCode[langPath] && this.allowedLangCode[langPath].isEnabled
  }
  isLocaleAvailable(langPath: string): boolean {
    return this.allowedLangCode[langPath] && this.allowedLangCode[langPath].isAvailable
  }
  private localeHrefPath(langPath: string): string | null {
    return this.allowedLangCode[langPath] &&
      this.allowedLangCode[langPath].isAvailable &&
      this.allowedLangCode[langPath].isEnabled
      ? `/${langPath}`
      : null
  }
  localeIcon(langPath: string) {
    const currentLocalConfig = this.configSvc.activeLocale
    if (
      this.allowedLangCode[langPath] &&
      this.allowedLangCode[langPath].isEnabled &&
      currentLocalConfig
    ) {
      return currentLocalConfig.path === langPath
        ? 'radio_button_checked'
        : 'radio_button_unchecked'
    }
    return 'not_interested'
  }

  async updateUserLang(locale: string) {
    const localePath = this.localeHrefPath(locale)
    if (localePath) {
      await this.settingsSvc.updateUserLocale(locale)
      location.href = localePath
    }
  }

  private updateActiveStatus() {
    this.darkModeForm.setValue(this.configSvc.isDarkMode)
    this.isRTLForm.setValue(this.configSvc.isRTL)
    if (this.configSvc.activeThemeObject) {
      this.activeThemeClass = this.configSvc.activeThemeObject.themeClass
    }
    if (this.configSvc.activeFontObject) {
      this.activeFontClass = this.configSvc.activeFontObject.fontClass
    }
  }
}
