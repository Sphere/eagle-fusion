import { computed, Injectable, signal } from '@angular/core'
import { Observable } from 'rxjs'
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout'
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class ValueService {
  width = signal(window.innerWidth)
  constructor(
    private breakpointObserver: BreakpointObserver,
  ) {
    window.addEventListener('resize', () => {
      this.width.set(window.innerWidth)
    })
  }

  isMobile = computed(() => this.width() < 768)
  isTabOrWeb = computed(() => this.width() >= 768)

  updateWidth(width: number) {
    this.width.set(width)
  }

  public isXSmall$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.XSmall])
    .pipe(map((res: BreakpointState) => res.matches))
  public isLtMedium$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small])
    .pipe(map((res: BreakpointState) => res.matches))

}
