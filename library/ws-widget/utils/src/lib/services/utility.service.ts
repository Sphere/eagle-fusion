import { Platform } from '@angular/cdk/platform'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
interface IWindowMobileAppModified extends Window {
  appRef?: any
  webkit?: any
}
declare var window: IWindowMobileAppModified

const RANDOM_ID_PER_USER = 0
interface IRecursiveData {
  identifier: string
  children: null | IRecursiveData[]
}

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  constructor(
    private http: HttpClient,
    private platform: Platform,
  ) { }

  get randomId() {
    return RANDOM_ID_PER_USER + 1
  }

  getJson<T>(url: string): Observable<T> {
    return this.http.get<T>(url)
  }

  getLeafNodes<T extends IRecursiveData>(node: T, nodes: T[]): T[] {
    if ((node.children || []).length === 0) {
      nodes.push(node)
    } else {
      if (node.children) {
        node.children.forEach(child => {
          this.getLeafNodes(child, nodes)
        })
      }
    }
    return nodes
  }
  getPath<T extends IRecursiveData>(node: T, id: string): T[] {
    const path: T[] = []
    this.hasPath(node, path, id)
    return path
  }

  private hasPath<T extends IRecursiveData>(node: T, pathArr: T[], id: string): boolean {
    if (node == null) {
      return false
    }
    pathArr.push(node)
    if (node.identifier === id) {
      return true
    }
    const children = node.children || []
    if (children.some(u => this.hasPath(u, pathArr, id))) {
      return true
    }
    pathArr.pop()
    return false
  }

  get isMobile(): boolean {
    if (this.isIos || this.isAndroid) {
      return true
    }
    return false
  }

  get isIos(): boolean {
    return this.platform.IOS
  }

  get isAndroid(): boolean {
    return this.platform.ANDROID
  }
  get isAndroidApp(): boolean {
    return Boolean(window.appRef)
  }

  get iOsAppRef() {
    if (
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.appRef
    ) {
      return window.webkit.messageHandlers.appRef
    }
    return null
  }
}
