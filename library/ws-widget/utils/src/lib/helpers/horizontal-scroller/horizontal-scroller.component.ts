import { Component, OnInit, OnChanges, OnDestroy, AfterViewInit, Input, Output, ViewChild, EventEmitter, ElementRef, NgZone, ChangeDetectorRef } from '@angular/core'
import {
  fromEvent,
  Subscription,
  timer,
} from 'rxjs'
import { debounceTime, throttleTime } from 'rxjs/operators'
import { TFetchStatus } from '../../constants/misc.constants'

@Component({
    standalone: false,
    selector: 'ws-utils-horizontal-scroller',
    templateUrl: './horizontal-scroller.component.html',
    styleUrls: ['./horizontal-scroller.component.scss'],

})
export class HorizontalScrollerComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

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
  private mutationObserver: MutationObserver | null = null

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) { }

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

  ngAfterViewInit() {
    if (this.horizontalScrollElem) {
      const elem = this.horizontalScrollElem.nativeElement as HTMLElement

      // Initial check — cards may already be in DOM when this runs
      setTimeout(() => {
        this.updateNavigationBtnStatus(elem)
        this.cdr.detectChanges()
      }, 0)

      // Watch for cards added asynchronously (data loads after view init)
      this.mutationObserver = new MutationObserver(() => {
        this.ngZone.run(() => {
          this.updateNavigationBtnStatus(elem)
          this.cdr.detectChanges()
        })
      })
      this.ngZone.runOutsideAngular(() => {
        this.mutationObserver!.observe(elem, { childList: true, subtree: true })
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
    if (this.mutationObserver) {
      this.mutationObserver.disconnect()
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
          left: (this.horizontalScrollElem.nativeElement.scrollLeft + clientWidth) - 45,
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
