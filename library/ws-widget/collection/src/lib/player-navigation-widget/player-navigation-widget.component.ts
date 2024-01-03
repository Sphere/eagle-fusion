import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { PlayerStateService } from '../../../../../../project/ws/viewer/src/lib/player-state.service'

@Component({
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

  constructor(
    private viewerDataSvc: PlayerStateService,
    private router: Router,
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
      this.router.navigate([this.prevResourceUrl], { queryParamsHandling: 'preserve' })
    }
  }

  navigateToNextResource() {
    this.router.navigate([this.nextResourceUrl ? this.nextResourceUrl : ''], { queryParamsHandling: 'preserve' })
  }

  get isProgressCheck(): boolean {
    if (typeof this.currentCompletionPercentage === 'undefined' ||
      this.currentCompletionPercentage !== 100) {
      return false
    }
    return true
  }
  stopPropagation() {
    return
  }
}
