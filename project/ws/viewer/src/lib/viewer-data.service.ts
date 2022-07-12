import { Injectable } from '@angular/core'
import { NsContent } from '@ws-widget/collection'
import { Subject, ReplaySubject } from 'rxjs'

export interface IViewerTocChangeEvent {
  tocAvailable: boolean
  nextResource: string | null
  prevResource: string | null
  previousTitle: string | null
  nextResTitle: string | null
  currentCompletionPercentage: number | null
  prevCompletionPercentage: number | null
}
export interface IViewerResourceOptions {
  page?: {
    min: number
    max: number
    current: number
    queryParamKey: string
  }
  zoom?: {
    min: number
    max: number
    current: number
    queryParamKey: string
  }
}
export type TStatus = 'pending' | 'done' | 'error' | 'none'

@Injectable({
  providedIn: 'root',
})
export class ViewerDataService {
  resourceId: string | null = null
  resource: NsContent.IContent | null = null
  primaryCategory: string | null = null
  error: any
  status: TStatus = 'none'
  resourceChangedSubject = new Subject<string>()
  changedSubject = new ReplaySubject(1)
  tocChangeSubject = new ReplaySubject<IViewerTocChangeEvent>(1)
  navSupportForResource = new ReplaySubject<IViewerResourceOptions>(1)
  fullScreenResource = new Subject<boolean>()
  // private setName = new BehaviorSubject<any>("");
  // To get the name from other component
  getFullScreenStatus = this.fullScreenResource.asObservable()
  gatingEnabled = false
  constructor() { }

  reset(resourceId: string | null = null, status: TStatus = 'none', primaryCategory?: string) {
    this.resourceId = resourceId
    this.resource = null
    this.error = null
    this.status = status
    this.primaryCategory = primaryCategory || ''
    this.changedSubject.next()
  }
  updateResource(resource: NsContent.IContent | null = null, error: any | null = null) {
    if (resource) {
      this.resource = resource
      if (resource && resource.identifier) {
        this.resourceId = resource.identifier
        this.primaryCategory = resource.primaryCategory
      }
      this.error = null
      this.status = 'done'
    } else {
      this.resource = null
      this.error = error
      this.status = 'error'
    }
    this.changedSubject.next()
  }
  // tslint:disable-next-line: max-line-length
  updateNextPrevResource({ isValid = true, prev = null, prevTitle, nextTitle, next = null, currentPercentage, prevCompletionPercentage }:
    { isValid: boolean; prev: string | null; prevTitle: string | null; nextTitle: string | null; next?: string | null, currentPercentage: number | null, prevCompletionPercentage: number | null }) {
    // tslint:disable-next-line:object-shorthand-properties-first
    this.tocChangeSubject.next(
      {
        tocAvailable: isValid,
        nextResource: next,
        prevResource: prev,
        previousTitle: prevTitle,
        nextResTitle: nextTitle,
        currentCompletionPercentage: currentPercentage,
        prevCompletionPercentage,
      },
    )
  }
  changeFullScreen(isFullScreen: boolean | undefined) {
    this.fullScreenResource.next(isFullScreen)
  }
  getNode(): boolean {
    return this.gatingEnabled
  }

  setNode(value: any) {
    this.gatingEnabled = value
  }
}
