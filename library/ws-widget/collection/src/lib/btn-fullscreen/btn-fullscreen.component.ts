import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import { Subscription, fromEvent } from 'rxjs'
import {
  getFullScreenElement,
  requestExitFullScreen,
  requestFullScreen,
} from './fullscreen.util'
import { Router } from '@angular/router'
import { LoggerService } from '../../../../utils/src/public-api'

@Component({
    standalone: false,
    selector: 'ws-widget-btn-fullscreen',
    templateUrl: './btn-fullscreen.component.html',
    styleUrls: ['./btn-fullscreen.component.scss'],
    
})
export class BtnFullscreenComponent extends WidgetBaseComponent
  implements OnInit, OnDestroy, NsWidgetResolver.IWidgetData<{ fsContainer: HTMLElement | null }> {
  @Input() widgetData!: { fsContainer: HTMLElement | null }
  @Output() fsState: EventEmitter<boolean> = new EventEmitter()
  containsQuizAssessment = false
  constructor(private readonly router: Router, private readonly logger: LoggerService) {
    super()
    this.logger.log(this.router.url.includes('quiz'))
    this.containsQuizAssessment = this.router.url.includes('quiz')
    this.logger.log(this.containsQuizAssessment)
  }
  isInFs = false
  fsChangeSubs: Subscription | null = null

  ngOnInit() {
    if (!this.widgetData.fsContainer) {
      return
    }
    this.isInFs = Boolean(getFullScreenElement())
    this.fsChangeSubs = fromEvent(document, 'fullscreenchange').subscribe(() => {
      this.isInFs = Boolean(getFullScreenElement())
      this.fsState.emit(this.isInFs)
    })
  }

  ngOnDestroy() {
    if (this.fsChangeSubs) {
      this.fsChangeSubs.unsubscribe()
    }
  }

  toggleFs() {
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
