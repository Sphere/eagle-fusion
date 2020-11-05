import { Injectable, LOCALE_ID, Inject } from '@angular/core'
import { ConfigurationsService, NsInstanceConfig, UserPreferenceService } from '@ws-widget/utils'

@Injectable({
  providedIn: 'root',
})
export class BtnSettingsService {
  private readonly htmlElem: HTMLElement = document.documentElement
  // private themeElem: HTMLLinkElement | HTMLScriptElement | null = null
  private fallbackTheme: NsInstanceConfig.ITheme | undefined | null = null
  private fallbackFont: NsInstanceConfig.IFontSize | undefined | null = null
  public useLinkForThemeInjection: boolean | null = null
  private loadedThemeStyles = new Set<string>()
  private notifyOnChange = true
  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private configurationsSvc: ConfigurationsService,
    private userPrefSvc: UserPreferenceService,
  ) { }

  initializePrefChanges(isProductionBuild: boolean) {
    this.notifyOnChange = false
    this.useLinkForThemeInjection = isProductionBuild
    this.fallbackTheme = this.computeFallbackTheme()
    this.fallbackFont = this.computeFallbackFont()
    // initialize theme
    this.changeTheme()
    // initialize fonts
    this.changeFont()
    // initialize theme mode
    let isDarkMode = this.configurationsSvc.isDarkMode
    if (this.configurationsSvc.userPreference && 'isDarkMode' in this.configurationsSvc.userPreference) {
      isDarkMode = this.configurationsSvc.userPreference.isDarkMode
    }
    // else {
    //   this.configurationsSvc.instanceConfig && this.configurationsSvc.instanceConfig.
    // }
    this.applyThemeMode(isDarkMode || false)
    // setup current locale Setting
    this.setLocaleSetting()
    if (this.configurationsSvc.userPreference) {
      this.configurationsSvc.completedTour = (this.configurationsSvc.userPreference.completedTour as boolean)
    }
    this.notifyOnChange = true
  }

  changeFont(fontClass = this.fallbackFont && this.fallbackFont.fontClass) {
    if (fontClass) {
      const font = this.getFontForKey(fontClass)
      if (font) {
        this.applyFont(font)
        return
      }
    }
    if (this.fallbackFont) {
      this.applyFont(this.fallbackFont)
    }
  }

  changeTheme(themeKey = this.fallbackTheme && this.fallbackTheme.themeClass) {
    if (themeKey) {
      const theme = this.getThemeForKey(themeKey)
      if (theme) {
        this.applyTheme(theme)
        return
      }
    }
    if (this.fallbackTheme) {
      this.applyTheme(this.fallbackTheme)
    }
  }

  private computeFallbackTheme(): NsInstanceConfig.ITheme | null | undefined {
    // check in User Pref
    if (this.configurationsSvc.userPreference) {
      const theme = this.getThemeForKey(this.configurationsSvc.userPreference.selectedTheme)
      if (theme) {
        return theme
      }
    }
    // check in instance Config
    const instanceConfig = this.configurationsSvc.instanceConfig
    if (instanceConfig) {
      const theme = this.getThemeForKey(instanceConfig.defaultThemeClass)
      if (theme) {
        return theme
      }
    }
    // first theme
    if (instanceConfig) {
      const theme = this.getThemeForKey(instanceConfig.themes[0].themeClass)
      if (theme) {
        return theme
      }
    }
    return null
  }
  private computeFallbackFont(): NsInstanceConfig.IFontSize | null | undefined {
    // check in User Pref
    if (this.configurationsSvc.userPreference) {
      const font = this.getFontForKey(this.configurationsSvc.userPreference.selectedFont)
      if (font) {
        return font
      }
    }
    // check in instance Config
    const instanceConfig = this.configurationsSvc.instanceConfig
    if (instanceConfig) {
      const font = this.getFontForKey(instanceConfig.defaultFontsize)
      if (font) {
        return font
      }
    }
    // check scale 0
    const fontSizes = instanceConfig && instanceConfig.fontSizes
    if (fontSizes) {
      const font = this.getFontForKey(fontSizes[Math.floor(fontSizes.length / 2)].fontClass)
      if (font) {
        return font
      }
    }
    // first font
    if (fontSizes) {
      const font = this.getFontForKey(fontSizes[0].fontClass)
      if (font) {
        return font
      }
    }
    return null
  }
  private getThemeForKey(key: string): NsInstanceConfig.ITheme | null | undefined {
    if (
      key &&
      this.configurationsSvc.instanceConfig &&
      Array.isArray(this.configurationsSvc.instanceConfig.themes)
    ) {
      return this.configurationsSvc.instanceConfig.themes.find(u => u.themeClass === key)
    }
    return null
  }
  private getFontForKey(key: string): NsInstanceConfig.IFontSize | null | undefined {
    if (
      key &&
      this.configurationsSvc.instanceConfig &&
      Array.isArray(this.configurationsSvc.instanceConfig.fontSizes)
    ) {
      return this.configurationsSvc.instanceConfig.fontSizes.find(u => u.fontClass === key)
    }
    return null
  }

  applyFont(font: NsInstanceConfig.IFontSize) {
    if (this.configurationsSvc.instanceConfig) {
      this.configurationsSvc.instanceConfig.fontSizes.forEach(u => {
        this.htmlElem.classList.remove(u.fontClass)
      })
      this.htmlElem.classList.add(font.fontClass)
      this.configurationsSvc.activeFontObject = font
      if (this.notifyOnChange) {
        this.configurationsSvc.prefChangeNotifier.next({ selectedFont: font.fontClass })
      }
    }
  }

  applyThemeMode(toDarkMode = true) {
    const [toRemove, toAdd] = toDarkMode ? ['day-mode', 'night-mode'] : ['night-mode', 'day-mode']
    this.htmlElem.classList.remove(toRemove)
    this.htmlElem.classList.add(toAdd)
    this.configurationsSvc.isDarkMode = toDarkMode
    if (this.notifyOnChange) {
      this.configurationsSvc.prefChangeNotifier.next({ isDarkMode: toDarkMode })
    }
  }

  intranetContentMode(internetAllowed = true) {
    this.configurationsSvc.isIntranetAllowed = internetAllowed
    if (this.notifyOnChange) {
      this.configurationsSvc.prefChangeNotifier.next({ isIntranetAllowed: this.configurationsSvc.isIntranetAllowed })
    }
  }

  private applyTheme(theme: NsInstanceConfig.ITheme) {
    if (!this.loadedThemeStyles.has(theme.themeClass)) {
      if (this.useLinkForThemeInjection) {
        const elem = document.createElement('link')
        elem.rel = 'stylesheet'
        elem.type = 'text/css'
        elem.href = `${theme.themeFile}.css`
        document.head.appendChild(elem)
      } else {
        const elem = document.createElement('script')
        // elem.charset = 'utf-8';
        elem.type = 'text/javascript'
        elem.src = `${theme.themeFile}.js`
        document.head.appendChild(elem)
      }
    }
    this.configurationsSvc.activeThemeObject = theme
    if (
      this.configurationsSvc.instanceConfig &&
      Array.isArray(this.configurationsSvc.instanceConfig.themes)
    ) {
      this.configurationsSvc.instanceConfig.themes.forEach(u => {
        this.htmlElem.classList.remove(u.themeClass)
      })
    }
    this.htmlElem.classList.add(theme.themeClass)
    if (this.notifyOnChange) {
      this.configurationsSvc.prefChangeNotifier.next({ selectedTheme: theme.themeClass })
    }

    this.updateAppColor(theme)
  }

  updateAppColor(theme: NsInstanceConfig.ITheme) {
    (document.getElementById('id-app-theme-color') as HTMLMetaElement).content = theme.color.primary
  }

  async updateUserLocale(locale: string): Promise<boolean> {
    if (this.configurationsSvc.userPreference) {
      this.configurationsSvc.userPreference.selectedLocale = locale
    }
    return this.userPrefSvc.saveUserPreference({ selectedLocale: locale })
  }

  private setLocaleSetting() {
    if (
      this.configurationsSvc.instanceConfig &&
      Array.isArray(this.configurationsSvc.instanceConfig.locals)
    ) {
      const activeLocale =
        this.configurationsSvc.instanceConfig.locals.find(u => u.locals.includes(this.configurationsSvc.userPreference
          && this.configurationsSvc.userPreference.selectedLocale || 'en')) ||
        null
      this.configurationsSvc.activeLocale = activeLocale
      if (activeLocale) {
        this.configurationsSvc.isRTL = activeLocale.isRTL
      }
      this.htmlElem.setAttribute('dir', this.configurationsSvc.isRTL ? 'rtl' : 'ltr')
      this.htmlElem.setAttribute('lang', this.locale)
    }
  }

  toggleRTL(setRTL?: boolean) {
    if (typeof setRTL === 'boolean') {
      this.configurationsSvc.isRTL = setRTL
    } else {
      this.configurationsSvc.isRTL = !this.configurationsSvc.isRTL
    }
    this.htmlElem.setAttribute('dir', this.configurationsSvc.isRTL ? 'rtl' : 'ltr')
    if (this.notifyOnChange) {
      this.configurationsSvc.prefChangeNotifier.next({ isRTL: this.configurationsSvc.isRTL })
    }
  }
}
