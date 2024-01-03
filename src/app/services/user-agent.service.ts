import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class UserAgentResolverService {

  constructor(
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
      os = null

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
      cookie = this.setCookie('USERUID', uniqueId, 1)
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
}
