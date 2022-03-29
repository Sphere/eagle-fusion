import { Component, HostListener, OnInit } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'ws-mobile-create-btn',
  templateUrl: './mobile-create-btn.component.html',
  styleUrls: ['./mobile-create-btn.component.scss'],
})
export class MobileCreateBtnComponent implements OnInit {
  showCreateBtn = false

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if ((event.target.innerWidth < 600) && (window.location.href.includes('/public/home'))) {
      this.showCreateBtn = false
    } else {
      this.showCreateBtn = true
    }
  }

  createAcct() {
    localStorage.removeItem('url_before_login')
    this.router.navigateByUrl('app/create-account')
  }

}
