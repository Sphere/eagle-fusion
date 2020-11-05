import { Subscription } from 'rxjs'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { ConfigurationsService } from '@ws-widget/utils'
import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef, HostListener, OnDestroy } from '@angular/core'
import { SafeUrl, DomSanitizer } from '@angular/platform-browser'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'

@Component({
  selector: 'ws-auth-root-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  // tslint:disable-next-line:use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
})
export class AuthRootComponent implements OnInit, OnDestroy {
  appIcon: SafeUrl | null = null
  isLoading = false
  loaderSubscription!: Subscription
  isWidthMessageShown = false
  constructor(
    private domSanitizer: DomSanitizer,
    private configSvc: ConfigurationsService,
    private loader: LoaderService,
    private changeDetector: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) { }

  async ngOnInit() {
    if (window.innerWidth < 1163 && !this.isWidthMessageShown) {
      this.isWidthMessageShown = true
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.WINDOW_SIZE_ERROR,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
    }
    this.loaderSubscription = this.loader.changeLoad.subscribe(
      data => {
        this.isLoading = data
        this.changeDetector.detectChanges()
      },
    )
    const instanceConfig = await this.configSvc.instanceConfig
    if (instanceConfig) {
      this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
        instanceConfig.logos.app,
      )
    }
  }

  ngOnDestroy() {
    if (this.loaderSubscription) {
      this.loaderSubscription.unsubscribe()
    }
    this.changeDetector.detach()
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth < 1163 && !this.isWidthMessageShown) {
      this.isWidthMessageShown = true
      this.snackBar.openFromComponent(NotificationComponent, {
        data: {
          type: Notify.WINDOW_SIZE_ERROR,
        },
        duration: NOTIFICATION_TIME * 1000,
      })
    }
  }

}
