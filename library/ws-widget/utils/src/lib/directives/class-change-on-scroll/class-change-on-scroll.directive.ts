import { Directive, Input, OnInit, HostBinding, OnDestroy, AfterViewInit } from '@angular/core'
import { Subscription, fromEvent } from 'rxjs'
import { debounceTime } from 'rxjs/operators'

enum ScrollingStateEnum {
  ScrollingUp,
  ScrollingDown,
  NoScrolling,
}

@Directive({
  selector: '[wsUtilsClassChangeOnScroll]',
})
export class ClassChangeOnScrollDirective implements OnInit, OnDestroy, AfterViewInit {

  @Input() wsClassOnScrollDirChange = 5000

  @HostBinding('class.scrolling-down') get isScrollingDown() {
    return this.currState === ScrollingStateEnum.ScrollingDown
  }
  @HostBinding('class.scrolling-up') get isScrollingUp() {
    return this.currState === ScrollingStateEnum.ScrollingUp
  }
  @HostBinding('class.scrolling-no') get isNotScrolling() {
    return this.currState === ScrollingStateEnum.NoScrolling
  }
  @HostBinding('class.scrolled-down') hasScrolledDown = false

  private windowScrollSubscription: Subscription | null = null
  private timeoutTimer: any

  private lastScreenTop = 0
  private currState: ScrollingStateEnum = ScrollingStateEnum.NoScrolling
  constructor() { }
  ngOnInit() {
    this.windowScrollSubscription = fromEvent<Event>(window, 'scroll')
      .pipe(debounceTime(50))
      .subscribe(() => {
        clearTimeout(this.timeoutTimer)
        const curr = window.scrollY
        this.hasScrolledDown = curr > 56
        this.setScrollState(this.lastScreenTop, curr)
        this.lastScreenTop = curr
      })
  }

  ngAfterViewInit() { }
  ngOnDestroy() {
    if (this.windowScrollSubscription) {
      this.windowScrollSubscription.unsubscribe()
    }
  }

  private setScrollState(prev: number = 0, curr: number = 0) {
    if (prev > curr) {
      this.currState = ScrollingStateEnum.ScrollingUp
    } else if (prev < curr) {
      this.currState = ScrollingStateEnum.ScrollingDown
    } else {
      this.currState = ScrollingStateEnum.NoScrolling
    }
    if (this.currState !== ScrollingStateEnum.NoScrolling) {
      this.resetScrollingState()
    }
  }
  private resetScrollingState() {
    this.timeoutTimer = setTimeout(
      () => {
        this.setScrollState()
      },
      this.wsClassOnScrollDirChange || 5000,
    )
  }

}
