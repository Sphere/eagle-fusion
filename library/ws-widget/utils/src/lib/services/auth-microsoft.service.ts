import { Injectable } from '@angular/core'
import { LoggerService } from './logger.service'
import { NsInstanceConfig } from './configurations.model'
import { HttpClient } from '@angular/common/http'
import { IWsMsTokenModelResponse } from './ms-office.model'
// TODO: Use a url-search-polyfill if the site didnot work in IE 11

const msTokenExpiryDuration = 600
const storageKey = 'msLoginRequested'
const storage = localStorage

const API_ENDPOINTS = {
  sharePointToken: '/apis/protected/v8/user/token',
}
@Injectable({
  providedIn: 'root',
})
export class AuthMicrosoftService {
  private msConfig: NsInstanceConfig.IMicrosoft = {
    clientId: '',
    tenant: '',
    defaultEmailId: '',
    validEmailExtensions: [],
    isConfigured: false,
  }
  private emailUsed: string | null = null
  private code: string | null = null
  private msToken: IWsMsTokenModelResponse = {
    accessToken: '',
    expiresOn: '',
    resource: '',
    tokenType: '',
  }

  constructor(private loggerSvc: LoggerService, private http: HttpClient) { }

  get isLogoutRequired(): boolean {
    return Boolean(this.msConfig.isConfigured && this.msConfig.clientId && this.emailUsed)
  }
  get loginUrl(): string | null {
    if (this.msConfig.isConfigured && this.msConfig.clientId) {
      const base = 'https://login.windows.net/common/oauth2/authorize'
      const searchParam = new URLSearchParams({
        response_type: 'code',
        client_id: this.msConfig.clientId,
        redirect_uri: window.location.href,
      })
      const fragment = location.search.substring(1)
      if (fragment) {
        return `${base}?${searchParam.toString()}#${fragment}`
      }
      return `${base}?${searchParam.toString()}`
    }
    return null
  }
  logoutUrl(redirectUrl: string) {
    if (this.isValidEmail(this.emailUsed || '')) {
      return `https://login.microsoftonline.com/common/oauth2/logout?post_logout_redirect_uri=${redirectUrl}`
    }
    return redirectUrl
  }

  // Behavior Methods

  async init(config: Pick<NsInstanceConfig.IConfig, 'microsoft'>) {
    if (!config || !config.microsoft || !config.microsoft.isConfigured) {
      this.loggerSvc.warn('Empty/No Configuration passed, ignoring Microsoft Authentication')
    }
    this.msConfig = config.microsoft
    const queryParams = new URLSearchParams(location.search)
    if (queryParams.has('code') && queryParams.has('session_state')) {
      this.code = queryParams.get('code')
      if (!this.code) {
        return
      }
      let url = location.origin + location.pathname
      await this.exchangeTokenForCode(this.code, url)
      if (location.hash) {
        url += location.hash.substring(1)
      }
      history.replaceState(null, '', url)
    }
  }

  async login(email: string) {
    if (!this.isValidEmail(email)) {
      this.loggerSvc.warn(`Microsoft Login is not allowed for your emailId (${email})`)
      return
    }
    const loginUrl = this.loginUrl
    if (loginUrl) {
      location.assign(loginUrl)
    } else {
      this.loggerSvc.warn('Unable to identify Office Login URL, Ignoring login request')
    }
  }

  async getToken(email: string): Promise<string> {
    if (
      this.msToken &&
      this.isValid(this.msToken.accessToken, this.msToken.expiresOn) &&
      this.msToken.accessToken
    ) {
      return this.msToken.accessToken
    }
    if (this.isValidEmail(email)) {
      try {
        this.msToken = await this.getTokenForEmail(email)
        if (this.msToken.accessToken) {
          this.emailUsed = email
          return this.msToken.accessToken
        }
      } catch (error) {
        if (!this.code) {
          this.login(email)
        }
      }
    }
    if (this.msConfig.defaultEmailId && this.isValidEmail(this.msConfig.defaultEmailId)) {
      try {
        this.msToken = await this.getTokenForEmail(this.msConfig.defaultEmailId)
        if (this.msToken.accessToken) {
          this.emailUsed = this.msConfig.defaultEmailId
          return this.msToken.accessToken
        }
      } catch (error) { }
    }
    throw new Error('UNABLE TO FETCH MS AUTH TOKEN')
  }

  loginForSSOEnabledEmbed(email: string) {
    if (!this.isValidEmail(email)) {
      this.loggerSvc.warn('SSO Login request Ignored. Invalid Email Id for SSO Enabled Content')
    }
    let msPrevTS = 0
    try {
      msPrevTS = parseInt(storage.getItem(storageKey) || '0', 10)
    } catch (error) { }
    if (!msPrevTS || (msPrevTS && (Date.now() - msPrevTS) / 1000 > msTokenExpiryDuration)) {
      this.loggerSvc.info(
        `last login exceeded ${msTokenExpiryDuration} duration. Redirecting to O365 login`,
      )
      storage.setItem(storageKey, Date.now().toString())
      this.login(email)
    }
  }

  isValidEmail(email: string) {
    return this.msConfig.validEmailExtensions.some(ext => email.endsWith(ext))
  }

  isValid(accessToken: string | undefined, expiresOn: string | undefined): boolean {
    if (accessToken && expiresOn) {
      // TODO: Implement expiredOn and Date comparison based validity
      return true
    }
    return false
  }

  async exchangeTokenForCode(code: string, redirectUrl: string): Promise<any> {
    const response = await this.http
      .get<IWsMsTokenModelResponse>(`${API_ENDPOINTS}?code=${code}&redirectUrl=${redirectUrl}`)
      .toPromise()
    return this.getInstanceFromResponse(response)
  }

  async getTokenForEmail(email: string): Promise<any> {
    const response = await this.http
      .get<IWsMsTokenModelResponse>(`${API_ENDPOINTS.sharePointToken}?email=${email}`)
      .toPromise()
    return this.getInstanceFromResponse(response)
  }

  getInstanceFromResponse(token: IWsMsTokenModelResponse) {
    return {
      accessToken: token.accessToken,
      expiresOn: token.expiresOn,
      resource: token.resource,
      tokenType: token.tokenType,
    }
  }
}
