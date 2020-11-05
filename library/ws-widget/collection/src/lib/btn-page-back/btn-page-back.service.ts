import { Injectable } from '@angular/core'
import { NavigationStart, Router } from '@angular/router'
import { Subscription } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class BtnPageBackService {
  widgetUrl!: string
  public previousRouteUrls: string[] = []
  private routerSubscription: Subscription | null = null
  constructor(
    private router: Router,
  ) { }

  public initialize() {

    if (this.routerSubscription) {

      this.routerSubscription.unsubscribe()
    }
    this.routerSubscription = this.router.events.subscribe((event: any) => {

      if (event instanceof NavigationStart) {

        if (event.url === this.previousRouteUrls[this.previousRouteUrls.length - 1]) {
          this.previousRouteUrls.pop()
        } else {
          const lastStoredUrl = this.previousRouteUrls[this.previousRouteUrls.length - 1]
          if (!lastStoredUrl || (lastStoredUrl && lastStoredUrl !== this.router.url)) {
            this.previousRouteUrls.push(this.router.url)

          }

          if (this.widgetUrl === event.url) {

            this.previousRouteUrls.pop()

          }

        }
      }
    })

  }

  getLastUrl(pageNumber: number = 1) {

    let lastUrl: string = this.previousRouteUrls[this.previousRouteUrls.length - pageNumber]
    let fragment
    if (!lastUrl) {
      lastUrl = '/'
      this.previousRouteUrls.push(lastUrl)
    }
    while (this.isUrlEncoded(lastUrl)) {
      lastUrl = decodeURIComponent(lastUrl)
    }
    if (lastUrl.includes('#')) {
      const urlFragmentParts = lastUrl.split('#')
      lastUrl = urlFragmentParts[0]
      fragment = urlFragmentParts[1]
    }
    if (lastUrl.includes('>')) {
      const parentPath = lastUrl.split('>').slice(0, -1).join('>')
      const childPath = lastUrl.split('>').slice(-1)[0]
      lastUrl = `${parentPath}>${encodeURIComponent(childPath)}`
    }
    return {
      fragment,
      route: lastUrl.split('?')[0],
      queryParams: this.getQParams(lastUrl.split('?')[1]),
    }
  }

  private getQParams(qParamsUrl: string) {
    let queryParamsUrl = qParamsUrl
    if (!queryParamsUrl || !queryParamsUrl.length) {
      return undefined
    }
    while (this.isUrlEncoded(queryParamsUrl)) {
      queryParamsUrl = decodeURIComponent(queryParamsUrl)
    }
    const qParamsArr = queryParamsUrl.split('&')
    let errorFlag = 0
    const qParams = qParamsArr
      .reduce(
        (acc: { [key: string]: string }, url: string) => {
          const splitUrls = url.split('=')
          if (splitUrls.length === 1) {
            errorFlag = 1
            return acc
          }
          acc[splitUrls[0]] = splitUrls[1]
          return acc
        },
        {},
    )
    if (errorFlag) {
      return undefined
    }
    return qParams
  }

  private isUrlEncoded(url: string): boolean {
    const receivedUrl = url || ''
    return receivedUrl !== decodeURIComponent(receivedUrl)
  }
  checkUrl(url: any) {
    this.widgetUrl = url
  }

}
