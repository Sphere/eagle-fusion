import { Component, OnInit, OnDestroy, Input } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

import { Subscription } from 'rxjs'
import { debounceTime } from 'rxjs/operators'

import { ConfigurationsService } from '@ws-widget/utils'

import { IWidgetErrorFeatureUnavailable } from './error-feature-unavailable.model'
@Component({
  selector: 'ws-widget-error-feature-unavailable',
  templateUrl: './error-feature-unavailable.component.html',
  styleUrls: ['./error-feature-unavailable.component.scss'],
})
export class ErrorFeatureUnavailableComponent implements OnInit, OnDestroy {
  @Input() errorData: IWidgetErrorFeatureUnavailable | null = null
  isDarkMode: boolean = this.configurationsSvc.isDarkMode

  private routeChangeSubs: Subscription | null = null
  private prefChangeSubs: Subscription | null = null
  constructor(private route: ActivatedRoute, private configurationsSvc: ConfigurationsService) {}

  ngOnInit() {
    if (!this.errorData) {
      this.routeChangeSubs = this.route.data.subscribe(response => {
        if (response.pageData.data) {
          this.errorData = response.pageData.data
        } else {
          this.errorData = null
        }
      })
    }

    this.prefChangeSubs = this.configurationsSvc.prefChangeNotifier
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.isDarkMode = this.configurationsSvc.isDarkMode
      })
  }
  ngOnDestroy() {
    if (this.prefChangeSubs) {
      this.prefChangeSubs.unsubscribe()
    }
    if (this.routeChangeSubs) {
      this.routeChangeSubs.unsubscribe()
    }
  }
}
