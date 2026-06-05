import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { LoggerService } from '../../../library/ws-widget/utils/src/public-api'
import { S3_END_POINTS } from '../constants/apiConstants'

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
      // Capture referrer at landing time as lowest-priority source fallback
      if (document.referrer) {
        try {
          lowerCasedSource['_referrer'] = new URL(document.referrer).hostname.replace(/^www\./, '')
        } catch { }
      }
      // Don't overwrite existing campaign UTM data with a referrer-only entry
      if (!lowerCasedSource['utm_source']) {
        const existing = localStorage.getItem('utm_source')
        if (existing) {
          try {
            if (JSON.parse(existing)['utm_source']) { return }
          } catch { }
        }
      }
      localStorage.setItem('utm_source', JSON.stringify(lowerCasedSource))
    }
  }

  private readonly GEO_KEY = 'telemetryGeoLocation'

  /**
   * Silently requests GPS permission and stores coordinates in sessionStorage.
   * Safe to call multiple times — skips if already collected or denied this session.
   * City/state resolution is done server-side from the lat/lng in the telemetry payload.
   */
  requestGeolocation(): void {
    const existing = sessionStorage.getItem(this.GEO_KEY)
    // Skip only if we already have valid coordinates
    if (existing && existing !== 'denied' && existing !== 'unavailable') {
      return
    }
    if (!navigator.geolocation) {
      sessionStorage.setItem(this.GEO_KEY, 'unavailable')
      return
    }
    // Check browser permission state before calling getCurrentPosition
    // to avoid a silent retry loop when the user has blocked location
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'denied') {
          // Browser has it blocked — update sessionStorage and stop
          sessionStorage.setItem(this.GEO_KEY, 'denied')
          return
        }
        // 'granted' or 'prompt' — proceed (popup shown for 'prompt', silent for 'granted')
        this.doGetCurrentPosition()
      }).catch(() => this.doGetCurrentPosition())
    } else {
      this.doGetCurrentPosition()
    }
  }

  private doGetCurrentPosition(): void {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude, accuracy } = position.coords
        const geoData = { latitude, longitude, accuracy, timestamp: Date.now() }
        sessionStorage.setItem(this.GEO_KEY, JSON.stringify(geoData))
      },
      () => {
        sessionStorage.setItem(this.GEO_KEY, 'denied')
      },
      { timeout: 10000, maximumAge: 300000 },
    )
  }

  getStoredGeolocation(): { latitude: number; longitude: number; accuracy: number; timestamp: number } | null {
    const raw = sessionStorage.getItem(this.GEO_KEY)
    if (!raw || raw === 'denied' || raw === 'unavailable') {
      return null
    }
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  getDeviceModel(): string | null {
    const ua = navigator.userAgent
    // Android: "Mozilla/5.0 (Linux; Android 11; SM-G991B) ..."
    const androidMatch = ua.match(/Android[^;]*;\s*([^)]+)\)/)
    if (androidMatch) {
      return androidMatch[1].trim()
    }
    // iOS: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 ...)" or "(iPad; ...)"
    const iosMatch = ua.match(/\((iPhone|iPad|iPod)[^)]*\)/)
    if (iosMatch) {
      return iosMatch[1]
    }
    return null
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

  getUtmParams(): {
    utm_source: string | null
    utm_medium: string | null
    utm_campaign: string | null
    utm_content: string | null
    utm_term: string | null
  } {
    const empty = { utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null, utm_term: null }
    const raw = this.getSource()
    if (!raw) { return empty }
    try {
      const params = JSON.parse(raw)
      return {
        utm_source: params['utm_source'] || params['orgid'] || params['_referrer'] || null,
        utm_medium: params['utm_medium'] || null,
        utm_campaign: params['utm_campaign'] || null,
        utm_content: params['utm_content'] || null,
        utm_term: params['utm_term'] || null,
      }
    } catch {
      return empty
    }
  }

  async isEditableForSphere(data: any): Promise<boolean> {
    try {
      const orgData = await this.http
        .get<{ id: string }[]>(S3_END_POINTS.SPHERE_PROFILE_UPDATE_ORG)
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
