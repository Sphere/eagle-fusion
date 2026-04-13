import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { KeycloakEvent, KeycloakEventType, KeycloakService } from 'keycloak-angular'
import { ReplaySubject } from 'rxjs'
import { AuthMicrosoftService } from './auth-microsoft.service'
import { ConfigurationsService } from './configurations.service'
import { LoggerService } from './logger.service'
import { API_END_POINTS } from '../../../../../../src/app/constants/apiConstants'
import { ThemeService } from '../../../../../../src/app/services/theme.service'

interface IParsedToken {
  email?: string
  encEmail?: string
  name?: string
  preferred_username?: string
}

const storage = localStorage
const storageKey = 'kc'

@Injectable({
  providedIn: 'root',
})
export class AuthKeycloakService {
  private loginChangeSubject = new ReplaySubject<boolean>(1)

  constructor(
    private http: HttpClient,
    private configSvc: ConfigurationsService,
    private keycloakSvc: KeycloakService,
    private msAuthSvc: AuthMicrosoftService,
    private logger: LoggerService,
    private themeSvc: ThemeService
  ) {
    this.loginChangeSubject.subscribe((isLoggedIn: boolean) => {
      this.configSvc.isAuthenticated = isLoggedIn
      if (
        isLoggedIn &&
        this.configSvc.instanceConfig &&
        Boolean(this.configSvc.instanceConfig.disablePidCheck)
      ) {
        this.configSvc.userProfile = {
          email: this.userEmail,
          userName: this.userName,
          userId: this.userId || '',
        }
      }
    })
  }

  // Getters
  get isLoggedIn$() {
    return this.loginChangeSubject.asObservable()
  }
  get isLoggedIn(): boolean {
    return this.keycloakSvc.isLoggedIn()
  }
  get isAuthenticated(): boolean | undefined {
    return this.keycloakSvc.getKeycloakInstance().authenticated
  }
  get token(): string | undefined {
    return this.keycloakSvc.getKeycloakInstance().token
  }
  get sessionId(): string | undefined {
    return this.keycloakSvc.getKeycloakInstance().sessionId
  }
  get userId(): string | undefined {
    const kc = this.keycloakSvc.getKeycloakInstance()
    if (!kc) {
      return ''
    }
    return (kc.tokenParsed && kc.tokenParsed.sub) || (kc.idTokenParsed && kc.idTokenParsed.sub)
  }

  get userEmail(): string | undefined {
    const kc = this.keycloakSvc.getKeycloakInstance()

    const tokenParsed = kc.tokenParsed as IParsedToken
    const idTokenParsed = kc.idTokenParsed as IParsedToken
    return (
      (tokenParsed && tokenParsed.email) ||
      (idTokenParsed && idTokenParsed.email) ||
      (idTokenParsed && idTokenParsed.encEmail) ||
      (tokenParsed && tokenParsed.preferred_username) ||
      (idTokenParsed && idTokenParsed.preferred_username)
    )
  }

  get userName(): string | undefined {
    const kc = this.keycloakSvc.getKeycloakInstance()
    return (
      (kc.tokenParsed && (kc.tokenParsed as IParsedToken).name) ||
      (kc.idTokenParsed && (kc.idTokenParsed as IParsedToken).name)
    )
  }

  async initAuth(): Promise<boolean> {
    if (!this.configSvc.instanceConfig) {
      return false
    }
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig.microsoft.isConfigured) {
      this.msAuthSvc.init({ microsoft: instanceConfig.microsoft })
    }
    try {
      this.addKeycloakEventListener()
      return await this.keycloakSvc.init({
        config: {
          url: instanceConfig.keycloak.url,
          realm: instanceConfig.keycloak.realm,
          clientId: instanceConfig.keycloak.clientId,
        },
        initOptions: {
          // ...this.getSavedKcConfig(),
          // onLoad: instanceConfig.keycloak.onLoad || 'check-sso',
          // checkLoginIframe: false,
        },
        enableBearerInterceptor: true,
        loadUserProfileAtStartUp: false,
        bearerExcludedUrls: instanceConfig.keycloak.bearerExcludedUrls,
      })
    } catch (err) {
      return false
    }
  }

  login(
    idpHint: 'E' | 'N' | 'S' = 'E',
    redirectUrl: string
  ) {
    // tslint:disable-next-line: no-console
    this.logger.log(idpHint, redirectUrl)
  }

  register(
    redirectUrl: string = this.defaultRedirectUrl,
  ): Promise<void> {
    return this.keycloakSvc.register({
      redirectUri: redirectUrl,
    })
  }

  async logout() {
    try {
      let theme = localStorage.getItem('theme')
      sessionStorage.clear()
      localStorage.removeItem('preferedLanguage')
      localStorage.removeItem('telemetrySessionId')
      localStorage.removeItem('loginbtn')
      localStorage.removeItem('url_before_login')
      localStorage.removeItem('tocData')
      localStorage.removeItem(`userUUID`)
      localStorage.removeItem('showConformation')
      localStorage.removeItem('loginDetailsWithToken')
      localStorage.clear()
      localStorage.setItem('theme', theme || 'light')
      if (theme == 'dark') {
        this.themeSvc.setTheme(true)
      }
      let url = `${document.baseURI}`
      let redirectUrl = `${url}public/home`
      window.location.href = redirectUrl
      await this.http.get(API_END_POINTS.LOGOUT_USER).toPromise()
    } catch (error) { }
  }
  private addKeycloakEventListener() {
    this.keycloakSvc.keycloakEvents$.subscribe((event: KeycloakEvent) => {
      switch (event.type) {
        case KeycloakEventType.OnAuthError:
          this.loginChangeSubject.next(false)
          break
        case KeycloakEventType.OnAuthLogout:
          this.loginChangeSubject.next(false)
          storage.removeItem(storageKey)
          break
        case KeycloakEventType.OnAuthRefreshError:
          break
        case KeycloakEventType.OnAuthRefreshSuccess:
          break
        case KeycloakEventType.OnAuthSuccess:
          break
        case KeycloakEventType.OnReady:
          this.loginChangeSubject.next(event?.args as any)
          if (event.args) {
            //   this.saveKeycloakConfig()
          }
          break
        case KeycloakEventType.OnTokenExpired:
          //  this.keycloakSvc.updateToken(60)
          break
      }
    })
  }

  private get defaultRedirectUrl(): string {
    try {
      const baseUrl = document.baseURI
      return baseUrl || location.origin
    } catch (error) {
      return location.origin
    }
  }
}
