import { Component, OnInit, OnChanges, OnDestroy, Input, Output, ViewChild, EventEmitter, ElementRef } from '@angular/core'
import {
  fromEvent,
  Subscription,
  timer,
} from 'rxjs'
import { debounceTime, throttleTime } from 'rxjs/operators'
import { TFetchStatus } from '../../constants/misc.constants'

@Component({
  selector: 'ws-utils-horizontal-scroller',
  templateUrl: './horizontal-scroller.component.html',
  styleUrls: ['./horizontal-scroller.component.scss'],
})
export class HorizontalScrollerComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  loadStatus: TFetchStatus = 'none'
  @Input()
  onHover = false
  @Output()
  loadNext = new EventEmitter()
  @ViewChild('horizontalScrollElem', { static: true })
  horizontalScrollElem: ElementRef | null = null

  enablePrev = false
  enableNext = false
  private scrollObserver: Subscription | null = null

  constructor() { }

  ngOnInit() {
    if (this.horizontalScrollElem) {
      const horizontalScrollElem = this.horizontalScrollElem
      this.scrollObserver = fromEvent(
        horizontalScrollElem.nativeElement,
        'scroll',
      )
        .pipe(debounceTime(100), throttleTime(100))
        .subscribe(_ => {
          this.updateNavigationBtnStatus(horizontalScrollElem
            .nativeElement as HTMLElement)
        })
    }
  }
  ngOnChanges() {
    timer(100).subscribe(() => {
      if (this.horizontalScrollElem) {
        this.updateNavigationBtnStatus(this.horizontalScrollElem
          .nativeElement as HTMLElement)
      }
    })
  }
  ngOnDestroy() {
    if (this.scrollObserver) {
      this.scrollObserver.unsubscribe()
    }
  }
  showPrev() {
    if (this.horizontalScrollElem) {
      // const elem = this.horizontalScrollElem.nativeElement
      // elem.scrollLeft -= 0.20 * elem.clientWidth
      if (this.horizontalScrollElem) {
        // const clientWidth = (this.horizontalScrollElem.nativeElement.clientWidth * 0.24)
        const clientWidth = (this.horizontalScrollElem.nativeElement.clientWidth)
        this.horizontalScrollElem.nativeElement.scrollTo({
          left: this.horizontalScrollElem.nativeElement.scrollLeft - clientWidth,
          behavior: 'smooth',
        })
      }
    }
  }
  showNext() {
    if (this.horizontalScrollElem) {
      // const elem = this.horizontalScrollElem.nativeElement
      // elem.scrollLeft += 0.20 * elem.clientWidth
      if (this.horizontalScrollElem) {
        // const clientWidth = (this.horizontalScrollElem.nativeElement.clientWidth * 0.24)
        const clientWidth = (this.horizontalScrollElem.nativeElement.clientWidth)
        this.horizontalScrollElem.nativeElement.scrollTo({
          left: this.horizontalScrollElem.nativeElement.scrollLeft + clientWidth,
          behavior: 'smooth',
        })
      }
    }
  }
  private updateNavigationBtnStatus(elem: HTMLElement) {
    this.enablePrev = true
    this.enableNext = true
    if (elem.scrollLeft === 0) {
      this.enablePrev = false
    }
    if (elem.scrollWidth === elem.clientWidth + elem.scrollLeft) {
      if (this.loadStatus === 'hasMore') {
        this.loadNext.emit()
      } else {
        this.enableNext = false
      }
    }
  }
}
