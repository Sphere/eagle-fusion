import { Component, OnInit, OnDestroy, Input } from '@angular/core'
import { ActivatedRoute } from '@angular/router'

import { Subscription } from 'rxjs'
import { debounceTime } from 'rxjs/operators'

import { ConfigurationsService } from '@ws-widget/utils'
import { IWidgetErrorAccessForbidden } from './error-access-forbidden.model'

@Component({
  selector: 'ws-widget-error-access-forbidden',
  templateUrl: './error-access-forbidden.component.html',
  styleUrls: ['./error-access-forbidden.component.scss'],
})
export class ErrorAccessForbiddenComponent implements OnInit, OnDestroy {
  @Input() errorData: null | IWidgetErrorAccessForbidden = null
  isDarkMode = this.configurationsSvc.isDarkMode

  private prefChangeSubs: Subscription | null = null
  private routeChangeSubs: Subscription | null = null

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

      this.prefChangeSubs = this.configurationsSvc.prefChangeNotifier
        .pipe(debounceTime(500))
        .subscribe(() => {
          this.isDarkMode = this.configurationsSvc.isDarkMode
        })
    }
  }
  ngOnDestroy() {
    if (this.routeChangeSubs) {
      this.routeChangeSubs.unsubscribe()
    }
    if (this.prefChangeSubs) {
      this.prefChangeSubs.unsubscribe()
    }
  }
}
