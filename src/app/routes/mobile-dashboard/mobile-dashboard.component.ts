import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'

@Component({
  selector: 'ws-mobile-dashboard',
  templateUrl: './mobile-dashboard.component.html',
  styleUrls: ['./mobile-dashboard.component.scss'],
})
export class MobileDashboardComponent implements OnInit {
  courseContent: any
  topThreeCourse: any

  constructor(private orgService: OrgServiceService,
    private router: Router,
  ) {
  }

  ngOnInit() {

    this.searchV6Wrapper()
  }

  searchV6Wrapper() {
    this.orgService.getLiveSearchResults().subscribe((result: any) => {
      this.courseContent = result.result.content
      this.topThreeCourse = this.courseContent.slice(1, 4)
    })
  }

  openIframe(event: any) {
    console.log(event)
    this.router.navigateByUrl('app/video-player')
  }
}
