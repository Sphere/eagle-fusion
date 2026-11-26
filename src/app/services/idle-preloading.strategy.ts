import { Injectable } from '@angular/core'
import { PreloadingStrategy, Route } from '@angular/router'
import { EMPTY, Observable, from, timer } from 'rxjs'
import { catchError, mergeMap } from 'rxjs/operators'

/**
 * Preloads lazy feature modules in the background without competing with the page.
 *
 * PreloadAllModules starts every chunk download the moment the first navigation ends, which
 * fills the browser's per-host connection limit and makes the current page's own API calls
 * (layout form, playlists, home.json) wait behind JavaScript it does not need yet.
 *
 * This strategy waits until the page has settled, then starts one chunk every STAGGER_MS,
 * each only once the browser is idle. Preloads are staggered rather than queued: the router's
 * load of a parent module waits for its children's preloads, so a strict one-at-a-time queue
 * would deadlock. Routes can opt out with `data: { preload: false }`, and nothing is
 * preloaded when the user has asked the browser to save data.
 */
@Injectable({ providedIn: 'root' })
export class IdlePreloadingStrategy implements PreloadingStrategy {
  /** Wait after the first navigation before preloading anything. */
  static readonly START_DELAY_MS = 8000
  /** Gap between the start of one preload and the next. */
  static readonly STAGGER_MS = 600

  private scheduled = 0

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    if (route.data && route.data['preload'] === false) {
      return EMPTY
    }
    if (typeof window === 'undefined' || this.saveDataRequested()) {
      return EMPTY
    }
    const slot = this.scheduled++
    return timer(IdlePreloadingStrategy.START_DELAY_MS + slot * IdlePreloadingStrategy.STAGGER_MS).pipe(
      mergeMap(() => from(this.whenIdle())),
      mergeMap(() => load()),
      catchError(() => EMPTY),
    )
  }

  private whenIdle(): Promise<void> {
    return new Promise(resolve => {
      const ric = (window as any).requestIdleCallback
      if (typeof ric === 'function') {
        ric(() => resolve(), { timeout: 3000 })
      } else {
        setTimeout(resolve, 200)
      }
    })
  }

  /** Respect the user's data-saver setting: no background downloads. */
  private saveDataRequested(): boolean {
    const connection = (navigator as any).connection
    return !!(connection && connection.saveData)
  }
}
