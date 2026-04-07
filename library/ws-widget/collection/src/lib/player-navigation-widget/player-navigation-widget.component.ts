import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { PlayerStateService } from '../../../../../../project/ws/viewer/src/lib/player-state.service'
import { ViewerDataService } from '../../../../../../project/ws/viewer/src/lib/viewer-data.service'
import { EventService } from '../../../../utils/src/public-api'

@Component({
    standalone: false,
    selector: 'app-player-navigation-widget',
    templateUrl: './player-navigation-widget.component.html',
    styleUrls: ['./player-navigation-widget.component.scss'],
    
})
export class PlayerNavigationWidgetComponent implements OnInit {

  viewerDataServiceSubscription: any
  prevResourceUrl: string | null = null
  nextResourceUrl: string | null = null
  currentCompletionPercentage: number | null = null
  firstResourceUrl: string | null = null
  isPlayBackBtnClicked = false
  isPlayNextBtnClicked = false

  constructor(
    private viewerDataSvc: PlayerStateService,
    private viewerData: ViewerDataService,
    private router: Router,
    private events: EventService
  ) { }

  ngOnInit() {
    this.viewerDataServiceSubscription = this.viewerDataSvc.playerState.subscribe(data => {
      if (data) {
        this.prevResourceUrl = data.prevResource
        this.nextResourceUrl = data.nextResource
        this.currentCompletionPercentage = data.currentCompletionPercentage
        this.firstResourceUrl = data.firstResource
      }
    })
  }

  navigateToPreResource() {
    if (this.prevResourceUrl) {
      this.isPlayBackBtnClicked = true
      this.generateInteractTelemetry('previous', this.prevResourceUrl.split('/').pop())
      this.router.navigate([this.prevResourceUrl], { queryParamsHandling: 'preserve' })
    }
  }

  navigateToNextResource() {
    if (this.isProgressCheck) {
      this.isPlayNextBtnClicked = true
      const navUrl = this.nextResourceUrl ? this.nextResourceUrl : this.firstResourceUrl
      this.generateInteractTelemetry('next', navUrl?.split('/').pop())
      this.router.navigate([navUrl], { queryParamsHandling: 'preserve' })
    }
  }

  get isProgressCheck(): boolean {
    // If gating is not enabled, allow next button by default
    if (!this.viewerData.gatingEnabled) {
      return true
    }
    // If gating is enabled, require 100% completion
    if (typeof this.currentCompletionPercentage === 'undefined' ||
      this.currentCompletionPercentage !== 100) {
      return false
    }
    return true
  }
  stopPropagation() {
    return
  }

  generateInteractTelemetry(status, identifier?) {
    const value = new Map()
    value['id'] = identifier
    value['type'] = "application/json"
    value['version'] = ""
    value["rollup"] = { l1: identifier, l2: identifier }
    this.events.raiseInteractTelemetry(
      'select-content',
      `play-${status}-content`,
      'player',
      value, { values: [{ identifier: identifier }] }
    )
  }
}
