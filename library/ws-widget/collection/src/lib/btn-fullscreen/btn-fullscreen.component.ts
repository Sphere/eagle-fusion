import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { Subscription, fromEvent } from 'rxjs'
import {
  getFullScreenElement,
  requestExitFullScreen,
  requestFullScreen,
  // hasFullScreenSupport,
} from './fullscreen.util'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-widget-btn-fullscreen',
  templateUrl: './btn-fullscreen.component.html',
  styleUrls: ['./btn-fullscreen.component.scss'],
})
export class BtnFullscreenComponent extends WidgetBaseComponent
  implements OnInit, OnDestroy, NsWidgetResolver.IWidgetData<{ fsContainer: HTMLElement | null }> {
  @Input() widgetData!: { fsContainer: HTMLElement | null }
  @Output() fsState: EventEmitter<boolean> = new EventEmitter()
  containsQuizAssessment = false;
  constructor(private router: Router) {
    super()
    console.log(this.router.url.includes('quiz'))
    this.containsQuizAssessment = this.router.url.includes('quiz')
    console.log(this.containsQuizAssessment)
  }
  // isFullScreenSupported = true
  isInFs = false
  fsChangeSubs: Subscription | null = null
  // isFullScreenSupported: boolean | undefined

  ngOnInit() {
    if (!this.widgetData.fsContainer) {
      return
    }
    this.isInFs = Boolean(getFullScreenElement())
    this.fsChangeSubs = fromEvent(document, 'fullscreenchange').subscribe(() => {
      this.isInFs = Boolean(getFullScreenElement())
      this.fsState.emit(this.isInFs)
    })
    // this.isFullScreenSupported = hasFullScreenSupport(this.widgetData.fsContainer)
  }

  ngOnDestroy() {
    if (this.fsChangeSubs) {
      this.fsChangeSubs.unsubscribe()
    }
  }

  toggleFs() {
    // let elem: any
    // elem = document
    // if (elem.fullscreenEnabled === false) {
    //   elem.documentElement.className = 'myClass'
    // }
    if (getFullScreenElement()) {
      requestExitFullScreen()
      this.fsState.emit(false)
    } else if (this.widgetData.fsContainer) {
      requestFullScreen(this.widgetData.fsContainer)
      this.fsState.emit(true)
      try {
        this.widgetData.fsContainer.classList.add('mat-app-background')
      } catch (err) {
        alert(err)
      }
    }

  }
}
