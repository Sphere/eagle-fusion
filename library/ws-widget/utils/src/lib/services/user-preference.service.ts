import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { IUserPreference } from './user-preference.model'
import { ConfigurationsService } from './configurations.service'
import { debounceTime, retry, catchError } from 'rxjs/operators'
import { of } from 'rxjs'
const endpoints = {
  userPref: '/apis/protected/v8/user/preference',
}
@Injectable({
  providedIn: 'root',
})
export class UserPreferenceService {
  // do changes in the backend and update the store

  constructor(private http: HttpClient, private configurationSvc: ConfigurationsService) { }

  initialize() {
    this.configurationSvc.prefChangeNotifier
      .pipe(debounceTime(250))
      .subscribe((changedUserPref?: Partial<IUserPreference>) => {
        if (this.configurationSvc.isAuthenticated) {
          this.saveUserPreference(changedUserPref)
        }
      })
  }

  async fetchUserPreference(): Promise<IUserPreference> {
    const pref = await this.http.get<IUserPreference>(endpoints.userPref).toPromise()
    return pref
  }

  async saveUserPreference(changedUserPref?: Partial<IUserPreference>): Promise<boolean> {
    try {
      if (!changedUserPref) {
        return false
      }
      const newUserPref: IUserPreference = {
        ...this.configurationSvc.userPreference,
        pinnedApps:
          (changedUserPref && changedUserPref.pinnedApps) ||
          (this.configurationSvc.userPreference &&
            this.configurationSvc.userPreference.pinnedApps) ||
          '',
        isDarkMode: this.configurationSvc.isDarkMode,
        isRTL: this.configurationSvc.isRTL,
        selectedTheme:
          (this.configurationSvc.activeThemeObject &&
            this.configurationSvc.activeThemeObject.themeClass) ||
          '',
        selectedFont:
          (this.configurationSvc.activeFontObject &&
            this.configurationSvc.activeFontObject.fontClass) ||
          '',
        selectedLangGroup:
          (this.configurationSvc.userPreference &&
            this.configurationSvc.userPreference.selectedLangGroup) ||
          '',
        selectedLocale:
          (this.configurationSvc.userPreference &&
            this.configurationSvc.userPreference.selectedLocale) ||
          '',
        colorPallet:
          (this.configurationSvc.userPreference &&
            this.configurationSvc.userPreference.colorPallet) ||
          [],
        defaultCardType:
          (this.configurationSvc.userPreference &&
            this.configurationSvc.userPreference.defaultCardType) ||
          '',
        completedActivity:
          (this.configurationSvc.userPreference &&
            this.configurationSvc.userPreference.completedActivity) ||
          [],
        ...(changedUserPref || {}),
        completedTour: this.configurationSvc.completedTour,
        profileSettings:
          (this.configurationSvc.userPreference &&
            this.configurationSvc.userPreference.profileSettings) ||
          this.configurationSvc.profileSettings,
      }
      const oldUserPref: IUserPreference | null = this.configurationSvc.userPreference
      this.configurationSvc.userPreference = newUserPref
      await this.http
        .put(endpoints.userPref, newUserPref)
        .pipe(
          retry(3),
          catchError(err => {
            this.configurationSvc.userPreference = oldUserPref
            return of(err)
          }),
        )
        .toPromise()
      return true
    } catch (err) {
      return false
    }
  }
}
