import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { LoggerService } from '../../../library/ws-widget/utils/src/public-api'

@Injectable({
  providedIn: 'root',
})
export class UserAgentResolverService {

  constructor(private http: HttpClient,
    private logger: LoggerService
  ) { }

  getUserAgent(): any {
    const userAgent = navigator.userAgent
    let browserName

    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = 'chrome'
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = 'firefox'
    } else if (userAgent.match(/safari/i)) {
      browserName = 'safari'
    } else if (userAgent.match(/opr\//i)) {
      browserName = 'opera'
    } else if (userAgent.match(/edg/i)) {
      browserName = 'edge'
    } else {
      browserName = 'No browser detection'
    }

    const OS = this.getOsInfo()
    return { OS, browserName }

  }

  getOsInfo = () => {

    let userAgent = window.navigator.userAgent.toLowerCase(),
      macosPlatforms = /(macintosh|macintel|macppc|mac68k|macos)/i,
      windowsPlatforms = /(win32|win64|windows|wince)/i,
      iosPlatforms = /(iphone|ipad|ipod)/i,
      os: any = null

    if (macosPlatforms.test(userAgent)) {
      os = 'MacOS'
    } else if (iosPlatforms.test(userAgent)) {
      os = 'iOS'
    } else if (windowsPlatforms.test(userAgent)) {
      os = 'Windows'
    } else if (/android/.test(userAgent)) {
      os = 'Android'
    } else if (!os && /linux/.test(userAgent)) {
      os = 'Linux'
    }

    return os

  }
  generateCookie(): any {
    let cookie: any
    if (this.isCookieExpired('USERUID')) {
      const timestamp = new Date().getTime().toString(36)
      const randomString = Math.random().toString(36).substring(2, 9)
      const uniqueId = timestamp + randomString
      cookie = this.setCookie('USERUID', uniqueId, 7)
    } else {
      cookie = this.getCookie('USERUID')
    }
    return cookie
  }
  setCookie = (name: any, value: any, days: any) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
    const cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
    document.cookie = cookie
    return cookie
  }

  isCookieExpired(cookieName: any) {
    const cookieValue = this.getCookie(cookieName)
    if (!cookieValue) {
      return true
    }
    if (cookieValue) {
      const cookieParts = cookieValue.split(';')
      for (let i = 0; i < cookieParts.length; i++) {
        const cookiePart = cookieParts[i].trim()
        if (cookiePart.startsWith('expires=')) {
          const expirationDate = new Date(cookiePart.substring('expires='.length))
          const currentDate = new Date()
          if (currentDate > expirationDate) {
            return true
          }
        }
      }
    }
    return false
  }

  getCookie(name: any) {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.startsWith(name + '=')) {
        return decodeURIComponent(cookie.substring(name.length + 1))
      }
    }
    return null
  }
  setSource(source: any) {
    this.logger.log("source set", source, typeof source)
    if (source && typeof source === 'object') {
      const lowerCasedSource: any = {}

      Object.keys(source).forEach(key => {
        const lowerKey = key.toLowerCase()
        const lowerValue = typeof source[key] === 'string'
          ? source[key].toLowerCase()
          : source[key]
        lowerCasedSource[lowerKey] = lowerValue
      })
      const utm_source = localStorage.setItem('utm_source', JSON.stringify(lowerCasedSource))
      return utm_source
    }
  }

  getSource(): any {
    const utm_source = localStorage.getItem('utm_source')
    this.logger.log("utm_source", utm_source)
    if (utm_source !== '{}') {
      return utm_source && utm_source.trim() !== ''
        ? utm_source
        : ""
    }
  }

  async isEditableForSphere(data: any): Promise<boolean> {
    try {
      const orgData = await this.http
        .get<{ id: string }[]>(`https://aastar-app-assets.s3.ap-south-1.amazonaws.com/sphere_profile_update_org.json`)
        .toPromise()
      const allowedOrgIds = orgData.map(item => item.id)
      const hasAccess = allowedOrgIds.includes(data?.rootOrgId)
      this.logger.log('Editable Access Check:', { rootOrgId: data?.rootOrgId, hasAccess })
      return hasAccess
    } catch (error) {
      this.logger.error('Error fetching org config:', error)
      return false
    }
  }

}
