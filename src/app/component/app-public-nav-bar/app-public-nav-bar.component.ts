import { Component, OnInit, OnDestroy, Input, HostListener, effect } from '@angular/core'
import { ConfigurationsService, ValueService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthKeycloakService } from './../../../../library/ws-widget/utils/src/lib/services/auth-keycloak.service'
@Component({
  selector: 'ws-app-public-nav-bar',
  templateUrl: './app-public-nav-bar.component.html',
  styleUrls: ['./app-public-nav-bar.component.scss'],
})
export class AppPublicNavBarComponent implements OnInit, OnDestroy {
  @Input() orgConfig: any
  private subscriptionLogin: Subscription | null = null
  redirectUrl = ''
  isXSmall$: boolean

  constructor(
    public configSvc: ConfigurationsService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private valueSvc: ValueService,
    private authSvc: AuthKeycloakService) {
    effect(() => {
      this.isXSmall$ = this.valueSvc.isMobile() ? true : false
    })
  }

  @HostListener('window:popstate', [])
  onPopState() {
    console.log('Back button pressed')
    location.href = '/public/home'
  }

  async ngOnInit() {
    const paramsMap = this.activateRoute.snapshot.queryParamMap
    const href = window.location.href
    if (paramsMap.has('ref')) {
      this.redirectUrl = document.baseURI + paramsMap.get('ref')
    } else if (href.indexOf('org-details') > 0) {
      this.redirectUrl = href
    } else {
      this.redirectUrl = `${document.baseURI}openid/keycloak`
    }
  }

  login(key: 'E' | 'N' | 'S') {
    if (localStorage.getItem('login_url')) {
      const url: any = localStorage.getItem('login_url')
      window.location.href = url
    }
    if (localStorage.getItem('url_before_login') && this.router.url === '/public/home') {
      localStorage.removeItem('url_before_login')
    }
    this.router.navigateByUrl('/public/login')
    this.authSvc.login(key, this.redirectUrl)
  }

  ngOnDestroy() {
    if (this.subscriptionLogin) {
      this.subscriptionLogin.unsubscribe()
    }
  }
}
