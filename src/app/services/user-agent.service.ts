import { Injectable } from '@angular/core'
import { LoggerService } from '../../../library/ws-widget/utils/src/public-api'

@Injectable({
  providedIn: 'root',
})
export class UserAgentResolverService {

  constructor(
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
  // Sphere's own hosts — navigation between these pages is not a real traffic source
  private readonly INTERNAL_HOSTS = ['sphere.aastrika.org', 'localhost', '127.0.0.1']

  private isInternalHost(host: string): boolean {
    return this.INTERNAL_HOSTS.some(h => host === h || host.endsWith('.' + h))
  }

  // External referrer hostname; null for internal navigation between Sphere pages
  private getExternalReferrerHost(): string | null {
    try {
      const host = new URL(document.referrer).hostname.replace(/^www\./, '')
      return this.isInternalHost(host) ? null : host
    } catch {
      return null
    }
  }

  // When a user lands on an org page (…/org-details?orgId=…) and is then redirected
  // (e.g. full-page redirect to /public/login), the orgId survives in document.referrer.
  private getOrgIdFromReferrer(): string | null {
    try {
      const url = new URL(document.referrer)
      if (url.pathname.includes('/org-details')) {
        return url.searchParams.get('orgId') || url.searchParams.get('orgid')
      }
    } catch { }
    return null
  }

  // Higher rank = stronger attribution signal, so a weaker/later source never
  // overwrites a stronger first-touch one: campaign > org > external referrer.
  private sourceRank(s: any): number {
    if (!s) { return 0 }
    if (s['utm_source']) { return 3 }
    if (s['orgid']) { return 2 }
    if (s['_referrer']) { return 1 }
    return 0
  }

  setSource(source: any) {
    this.logger.log('source set', source, typeof source)
    if (!source || typeof source !== 'object') { return }

    const lowerCasedSource: any = {}
    Object.keys(source).forEach(key => {
      const lowerKey = key.toLowerCase()
      lowerCasedSource[lowerKey] = typeof source[key] === 'string'
        ? source[key].toLowerCase()
        : source[key]
    })

    // Recover org attribution from an internal org-details referrer (survives login redirects)
    if (!lowerCasedSource['orgid'] && !lowerCasedSource['utm_source']) {
      const orgFromReferrer = this.getOrgIdFromReferrer()
      if (orgFromReferrer) {
        lowerCasedSource['orgid'] = orgFromReferrer.toLowerCase()
      }
    }

    // Capture only external referrers — internal Sphere navigation is not a traffic source
    if (!lowerCasedSource['_referrer']) {
      const referrerHost = this.getExternalReferrerHost()
      if (referrerHost) {
        lowerCasedSource['_referrer'] = referrerHost
      }
    }

    const newRank = this.sourceRank(lowerCasedSource)
    if (newRank === 0) { return }   // nothing meaningful — don't store noise

    // Preserve the first/strongest source already captured for this visit
    const existing = localStorage.getItem('utm_source')
    if (existing && existing !== '{}') {
      try {
        if (this.sourceRank(JSON.parse(existing)) >= newRank) { return }
      } catch { }
    }
    localStorage.setItem('utm_source', JSON.stringify(lowerCasedSource))
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

}
