import { Injectable } from '@angular/core'
import { BehaviorSubject, ReplaySubject } from 'rxjs'
import { get, isUndefined } from 'lodash'
import { map, take } from 'rxjs/operators'

export interface IPlayerSateStore {
  tocAvailable: boolean
  nextResource: string | null
  prevResource: string | null
  previousTitle: string | null
  nextResTitle: string | null
  currentCompletionPercentage: number | null
  prevCompletionPercentage: number | null
  nextContentId: string | null
  firstResource: string | null
}

/** Minimal shape of a queue leaf node needed to derive player navigation state. */
export interface IPlayerQueueNode {
  identifier: string
  viewerUrl: string
  title: string
  completionPercentage?: number
}

/**
 * Derive the player navigation state for the resource identified by `resourceId`
 * from the leaf-node queue. Kept as a pure function so the completion-sync logic
 * that drives the Next button can be unit-tested without the heavy TOC component
 * import graph.
 *
 * `currentPercentage` is taken from the resource's OWN queue node (the same object
 * that drives the completion tick), so the Next gate stays in sync with the tick
 * on every navigation — including revisiting an already-completed resource, where
 * no fresh progress message is emitted. Indexing by `resourceId` means the previous
 * resource's percentage is never inherited. An undefined percentage collapses to null.
 */
export function buildPlayerStateForResource(
  queue: IPlayerQueueNode[],
  resourceId: string | null,
  isValid: boolean,
): {
  isValid: boolean; prev: string | null; prevTitle: string | null; nextTitle: string | null; next: string | null
  currentPercentage: number | null; prevPercentage: number | null; nextContentId: string | null; firstResource: string | null
} {
  const safeQueue = queue || []
  const currentIndex = safeQueue.findIndex(c => c.identifier === resourceId)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex >= 0 && currentIndex + 1 < safeQueue.length
  return {
    isValid,
    prev: hasPrev ? safeQueue[currentIndex - 1]?.viewerUrl : null,
    prevTitle: hasPrev ? safeQueue[currentIndex - 1]?.title : null,
    next: hasNext ? safeQueue[currentIndex + 1]?.viewerUrl : null,
    nextTitle: hasNext ? safeQueue[currentIndex + 1]?.title : null,
    currentPercentage: currentIndex >= 0 ? safeQueue[currentIndex]?.completionPercentage ?? null : null,
    prevPercentage: hasPrev ? safeQueue[currentIndex - 1]?.completionPercentage ?? null : null,
    nextContentId: hasNext ? safeQueue[currentIndex + 1]?.identifier : null,
    firstResource: safeQueue[0]?.viewerUrl || null,
  }
}
@Injectable({
  providedIn: 'root',
})

export class PlayerStateService {

  playerState = new ReplaySubject<IPlayerSateStore>(1)
  trigger$ = new BehaviorSubject<any>(undefined)
  // tslint:disable-next-line: max-line-length
  setState({ isValid = true, prev = null, prevTitle, nextTitle, next = null, currentPercentage, prevPercentage, nextContentId, firstResource }:
    // tslint:disable-next-line: max-line-length
    { isValid: boolean; prev: string | null; prevTitle: string | null; nextTitle: string | null; next?: string | null, currentPercentage: number | null, prevPercentage: number | null, nextContentId: string | null, firstResource: string | null }) {
    // tslint:disable-next-line:object-shorthand-properties-first
    this.playerState.next(
      {
        tocAvailable: isValid,
        nextResource: next,
        prevResource: prev,
        previousTitle: prevTitle,
        nextResTitle: nextTitle,
        currentCompletionPercentage: currentPercentage,
        prevCompletionPercentage: prevPercentage,
        nextContentId,
        firstResource: firstResource,
      },
    )
  }

  getCurrentCompletionPercentage() {
    let currentCompletionPercentage: any
    this.playerState.subscribe((data: any) => {
      if (get(data, 'currentCompletionPercentage')) {
        currentCompletionPercentage = get(data, 'currentCompletionPercentage')
      }
    })
    return currentCompletionPercentage
  }

  getPrevCompletionPercentage() {
    let prevCompletionPercentage: any
    this.playerState.subscribe((data: any) => {
      if (get(data, 'prevCompletionPercentage')) {
        prevCompletionPercentage = get(data, 'prevCompletionPercentage')
      }
    })
    return prevCompletionPercentage
  }

  getPrevResource() {
    let prevResource: any
    const tdata = this.trigger$.getValue()
    if (isUndefined(tdata)) {
      this.playerState.subscribe((data: any) => {
        if (get(data, 'prevResource')) {
          prevResource = get(data, 'prevResource')
          this.trigger$.next(prevResource)
        }
      })
      return prevResource
    }
    return prevResource

  }

  getNextResource() {
    let nextResource = ''
    this.playerState.pipe(take(1)).subscribe((data: any) => {
      if (get(data, 'nextResource')) {
        nextResource = get(data, 'nextResource')
        return nextResource
      }
      return nextResource
    })
    return nextResource
  }

  isResourceCompleted() {
    let isResourceCompleted = false
    const tdata = this.trigger$.getValue()
    if (tdata !== 'triggered' || isUndefined(tdata)) {
      this.playerState.pipe(map((data: any) => get(data, 'currentCompletionPercentage') === 100 ? true : false)).
        subscribe((data: any) => {
          if (data) {
            isResourceCompleted = data
          } else {
            this.trigger$.next('not-triggered')
          }
          return isResourceCompleted
        })
    } else {
      isResourceCompleted = false
    }
    return isResourceCompleted
  }

}
