import { Injectable } from '@angular/core'
import { BehaviorSubject, ReplaySubject } from 'rxjs'
import * as _ from 'lodash'
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
}
@Injectable({
  providedIn: 'root',
})

export class PlayerStateService {

  playerState = new ReplaySubject<IPlayerSateStore>(1)
  trigger$ = new BehaviorSubject<any>(undefined)
  // tslint:disable-next-line: max-line-length
  setState({ isValid = true, prev = null, prevTitle, nextTitle, next = null, currentPercentage, prevPercentage, nextContentId }:
    // tslint:disable-next-line: max-line-length
    { isValid: boolean; prev: string | null; prevTitle: string | null; nextTitle: string | null; next?: string | null, currentPercentage: number | null, prevPercentage: number | null, nextContentId: string | null }) {
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
        nextContentId: nextContentId
      },
    )
  }

  getCurrentCompletionPercentage() {
    let currentCompletionPercentage: any
    this.playerState.subscribe((data: any) => {
      if (_.get(data, 'currentCompletionPercentage')) {
        currentCompletionPercentage = _.get(data, 'currentCompletionPercentage')
      }
    })
    return currentCompletionPercentage
  }

  getPrevCompletionPercentage() {
    let prevCompletionPercentage: any
    this.playerState.subscribe((data: any) => {
      if (_.get(data, 'prevCompletionPercentage')) {
        prevCompletionPercentage = _.get(data, 'prevCompletionPercentage')
      }
    })
    return prevCompletionPercentage
  }

  getPrevResource() {
    let prevResource: any
    const tdata = this.trigger$.getValue()
    if (_.isUndefined(tdata)) {
      this.playerState.subscribe((data: any) => {
        if (_.get(data, 'prevResource')) {
          prevResource = _.get(data, 'prevResource')
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
      if (_.get(data, 'nextResource')) {
        nextResource = _.get(data, 'nextResource')
        return nextResource
      }
      return nextResource
    })
    return nextResource
  }

  isResourceCompleted() {
    let isResourceCompleted = false
    const tdata = this.trigger$.getValue()
    if (tdata !== 'triggered' || _.isUndefined(tdata)) {
      this.playerState.pipe(map((data: any) => _.get(data, 'currentCompletionPercentage') === 100 ? true : false)).
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
