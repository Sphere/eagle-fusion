import { OrgServiceService } from './../../org-service.service'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'ws-app-all-courses',
  templateUrl: './all-courses.component.html',
  styleUrls: ['./all-courses.component.scss'],
})
export class AllCoursesComponent implements OnInit {
  orgName: any
  courseData = []

  array = []
  sum = 15
  throttle = 300
  scrollDistance = 1
  scrollUpDistance = 2
  direction = ''
  start = 0
  totalHits: any
  constructor(private activateRoute: ActivatedRoute, private router: Router, private orgService: OrgServiceService) { }

  ngOnInit() {
    this.getCourses()
    this.orgName = this.activateRoute.snapshot.queryParams.orgId
  }

  gotoOrgPage() {
    this.router.navigate(['/app/org-details/'], { queryParams: { orgId: this.orgName } })
  }

  getCourses() {
    this.orgService.getDatabyOrgId().then((response: any) => {
      this.courseData = response.result
      this.totalHits = response.totalHits
      this.addItems(this.start, this.sum)
    })
  }

  addItems(index: number, sum: number) {

    for (let i = index; i < sum; i += 1) {

      this.array.push(this.courseData[i])
    }
  }

  onScrollDown() {
    // add another 20 items
    this.start = this.sum
    if (this.totalHits > this.sum) {
      this.sum += 20
    } else {
      this.sum = this.totalHits - this.sum
    }

    this.getCourses()
    this.direction = 'down'
  }

}
