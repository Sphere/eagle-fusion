import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { KeycloakEvent, KeycloakEventType, KeycloakInitOptions, KeycloakService } from 'keycloak-angular'
import { fromEvent, ReplaySubject } from 'rxjs'
import { filter } from 'rxjs/operators'
import { AuthMicrosoftService } from './auth-microsoft.service'
import { ConfigurationsService } from './configurations.service'

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
  get isLoggedIn(): Promise<boolean> {
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
      return
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
      this.setupGlobalAuthResponder()
      this.addKeycloakEventListener()
      return await this.keycloakSvc.init({
        config: {
          url: instanceConfig.keycloak.url,
          realm: instanceConfig.keycloak.realm,
          clientId: instanceConfig.keycloak.clientId,
        },
        initOptions: {
          ...this.getSavedKcConfig(),
          onLoad: instanceConfig.keycloak.onLoad || 'check-sso',
          checkLoginIframe: false,
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
    redirectUrl: string = this.defaultRedirectUrl,
  ): Promise<void> {
    return this.keycloakSvc.login({
      idpHint,
      redirectUri: redirectUrl,
    })
  }

  register(
    redirectUrl: string = this.defaultRedirectUrl,
  ): Promise<void> {
    return this.keycloakSvc.register({
      redirectUri: redirectUrl,
    })
  }

  async logout(redirectUrl = this.defaultRedirectUrl) {
    storage.removeItem(storageKey)
    await this.http.get('/apis/reset').toPromise()
    if (this.msAuthSvc.isLogoutRequired) {
      this.keycloakSvc.logout(this.msAuthSvc.logoutUrl(redirectUrl))
    } else {
      this.keycloakSvc.logout(redirectUrl)
    }
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
          this.loginChangeSubject.next(event.args)
          if (event.args) {
            this.saveKeycloakConfig()
          }
          break
        case KeycloakEventType.OnTokenExpired:
          this.keycloakSvc.updateToken(60)
          break
      }
    })
  }

  private setupGlobalAuthResponder() {
    fromEvent<MessageEvent>(window, 'message')
      .pipe(
        filter(
          (event: MessageEvent) =>
            Boolean(event) &&
            Boolean(event.data) &&
            event.data.type === 'AUTH_REQUEST' &&
            Boolean(event.source && typeof event.source.postMessage === 'function'),
        ),
      )
      .subscribe(async (event: MessageEvent) => {
        const contentWindow = event.source as Window
        const token = await this.keycloakSvc.getToken()
        const response = {
          app: 'WEB_PORTAL',
          type: 'AUTH_RESPONSE',
          state: 'NONE',
          plugin: 'NONE',
          data: {
            token,
            id: event.data && event.data.data && event.data.data.id,
          },
        }
        contentWindow.postMessage(response, '*')
      })
  }

  // Utility Methods
  private saveKeycloakConfig() {
    const kc = this.keycloakSvc.getKeycloakInstance()
    const kcInitOptions: KeycloakInitOptions = {
      idToken: kc.idToken,
      refreshToken: kc.refreshToken,
      timeSkew: kc.timeSkew,
      token: kc.token,
    }
    storage.setItem(storageKey, JSON.stringify(kcInitOptions))
  }
  private getSavedKcConfig(): KeycloakInitOptions {
    try {
      // const lastSaved = KEYCLOAK_STORAGE.getItem(key);
      const lastSaved = storage.getItem(storageKey)
      if (lastSaved) {
        const processed = JSON.parse(lastSaved)
        if (
          'idToken' in processed &&
          'refreshToken' in processed &&
          'timeSkew' in processed &&
          'token' in processed
        ) {
          return processed
        }
      }
    } catch (e) { }
    return {}
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
