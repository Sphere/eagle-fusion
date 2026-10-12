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
  scromChangeSubject = new Subject<any>()
  // Shared mutex-style flag for the course-completion congrats/rating-confirm flow.
  // viewer-toc.component.ts and quiz.component.ts each independently detect course
  // completion (via different signals — currentMessage/scorm events vs player-state/batch
  // list) and each show their own congrats-popup + rating-confirm-modal + navigate sequence.
  // Both components are mounted at the same time in the viewer (see viewer.component.html),
  // so without a shared flag, one flow's "is a dialog already open" check can't see the
  // other flow starting up before its dialog is actually registered — letting them race and
  // navigate away before the user's rating is submitted. Set true the instant either flow
  // begins, false once its dialog chain fully resolves.
  isCourseCompletionFlowActive = false
  // Set to a course identifier the instant a rating is genuinely CONFIRMED-submitted for it
  // (viewer-toc.component.ts / quiz.component.ts, right where they call
  // completeCourseNavigation()/navigateToCourseOverview()). app-toc-desktop.component.ts
  // reads and consumes (nulls out) this field on init/content-change to force a fresh
  // rating-summary fetch for that exact course, instead of relying only on the implicit
  // "navigating here always remounts the component" assumption. Consuming it (setting back
  // to null) after one use means a later, unrelated visit to the same course overview page
  // doesn't keep forcing redundant refetches.
  lastRatingSubmittedCourseId: string | null = null
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
    this.gatingEnabled = false  // Reset gating flag when changing courses
    this.changedSubject.next(undefined)
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
    this.changedSubject.next(undefined)
  }
  // tslint:disable-next-line: max-line-length
  updateNextPrevResource({ isValid = true, prev = null, prevTitle, nextTitle, next = null, currentPercentage, prevPercentage }:
    // tslint:disable-next-line: max-line-length
    { isValid: boolean; prev: string | null; prevTitle: string | null; nextTitle: string | null; next?: string | null, currentPercentage: number | null, prevPercentage: number | null }) {
    // tslint:disable-next-line:object-shorthand-properties-first
    this.tocChangeSubject.next(
      {
        tocAvailable: isValid,
        nextResource: next,
        prevResource: prev,
        previousTitle: prevTitle,
        nextResTitle: nextTitle,
        currentCompletionPercentage: currentPercentage,
        prevCompletionPercentage: prevPercentage,
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
