import { Component, OnInit } from '@angular/core'
import { OrgServiceService } from './../org-home-service.service'

@Component({
  selector: 'ws-org-home',
  templateUrl: './org-home.component.html',
  styleUrls: ['./org-home.component.scss']
})
export class OrgHomeComponent implements OnInit {
  courses: any
  resultResponse: any

  constructor(private orgService: OrgServiceService) {

  }



  ngOnInit() {
    this.orgService.getLiveSearchResults().subscribe((response: any) => {
      console.log("Total course >>>>>>>>>>>>>>>>" + JSON.stringify(response.result.content))
      this.resultResponse = response.result.content
      //console.log("k f sTotal courses >>>>>>>>>>>>>>>>" + response.result[0].description)

    })
  }

  getCourseDetails() {
    this.orgService.getDatabyOrgId().then((response: any) => {
      console.log("Total course >>>>>>>>>>>>>>>>" + response)
    })
  }

}
