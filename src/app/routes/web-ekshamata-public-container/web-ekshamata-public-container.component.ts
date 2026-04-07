import { Component, effect, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { LoggerService, ValueService } from '../../../../library/ws-widget/utils/src/public-api'

@Component({
  selector: 'web-ekshamata-public-container',
  templateUrl: './web-ekshamata-public-container.component.html',
  styleUrls: ['./web-ekshamata-public-container.component.scss'],
})
export class WebEkshamataPublicComponent implements OnInit {

  isXSmall$ = false

  constructor(private readonly router: Router, private readonly valueSvc: ValueService,
    private logger: LoggerService
  ) {
    effect(() => {
      this.isXSmall$ = this.valueSvc.isMobile() ? true : false
    })
  }
  ngOnInit(): void {
    this.logger.log("public ekshamata home component")
  }

  login() {
    if (localStorage.getItem('login_url')) {
      const url: any = localStorage.getItem('login_url')
      window.location.href = url
      return
    }
    if (localStorage.getItem('url_before_login') && this.router.url === '/public/home') {
      localStorage.removeItem('url_before_login')
    }
    this.router.navigate(['/public/login'], { queryParams: { ekshamtaLogin: true } })

  }

}
