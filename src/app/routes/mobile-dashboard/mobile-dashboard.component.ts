import { Component, OnInit } from '@angular/core'
import { OrgServiceService } from '../../../../project/ws/app/src/lib/routes/org/org-service.service'

@Component({
  selector: 'ws-mobile-dashboard',
  templateUrl: './mobile-dashboard.component.html',
  styleUrls: ['./mobile-dashboard.component.scss'],
})
export class MobileDashboardComponent implements OnInit {
  courseContent: any

  constructor(private orgService: OrgServiceService) {
  }

  ngOnInit() {

    this.searchV6Wrapper()
  }

  searchV6Wrapper() {
    this.orgService.getLiveSearchResults().subscribe((result: any) => {
      this.courseContent = result.result.content
      console.log(this.courseContent[0])
      this.courseContent.splice(3)
    })
  }
}
