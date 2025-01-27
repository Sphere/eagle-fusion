import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'web-ekshamata-public-container',
  templateUrl: './web-ekshamata-public-container.component.html',
  styleUrls: ['./web-ekshamata-public-container.component.scss'],
})
export class WebEkshamataPublicComponent implements OnInit {


  constructor(private router: Router
  ) {
  }

  async ngOnInit() {

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
