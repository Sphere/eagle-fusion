import { Component, OnInit, HostListener } from '@angular/core'
import { Router } from '@angular/router'
import { ValueService, ConfigurationsService } from '@ws-widget/utils'
import { ScrollService } from '../../services/scroll.service'

@Component({
  selector: 'ws-mobile-home',
  templateUrl: './mobile-home.component.html',
  styleUrls: ['./mobile-home.component.scss'],
})
export class MobileHomeComponent implements OnInit {
  showCreateBtn = false
  bannerStatus: any
  constructor(private router: Router, private valueSvc: ValueService, public configSvc: ConfigurationsService,

    private scrollService: ScrollService
  ) { }

  ngOnInit() {
    this.bannerStatus = this.configSvc.bannerStats
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall && (this.configSvc.userProfile === null)) {
        this.showCreateBtn = true
      } else {
        this.showCreateBtn = false
      }
    })
  }
  scrollToHowSphereWorks() {
    this.scrollService.scrollToDivEvent.emit('scrollToHowSphereWorks')
  }
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      if (isXSmall && (this.configSvc.userProfile === null)) {
        this.showCreateBtn = true
      } else {
        this.showCreateBtn = false
      }
    })
  }
  createAcct() {
    localStorage.removeItem('url_before_login')
    this.router.navigateByUrl('app/create-account')
  }

}
