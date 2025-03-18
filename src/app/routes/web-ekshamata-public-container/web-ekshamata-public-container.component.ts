import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { ValueService } from '../../../../library/ws-widget/utils/src/public-api'
import { Observable } from 'rxjs'

@Component({
  selector: 'web-ekshamata-public-container',
  templateUrl: './web-ekshamata-public-container.component.html',
  styleUrls: ['./web-ekshamata-public-container.component.scss'],
})
export class WebEkshamataPublicComponent implements OnInit {

  isXSmall$: Observable<boolean>

  constructor(private readonly router: Router, private readonly valueSvc: ValueService,
  ) {
    this.isXSmall$ = this.valueSvc.isXSmall$
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.')
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
