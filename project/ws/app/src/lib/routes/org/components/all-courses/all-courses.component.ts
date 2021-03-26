import { OrgServiceService } from './../../org-service.service'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'ws-app-all-courses',
  templateUrl: './all-courses.component.html',
  styleUrls: ['./all-courses.component.scss']
})
export class AllCoursesComponent implements OnInit {
  orgName: any
  courseData = []

  array = []
  sum = 15
  throttle = 300
  scrollDistance = 1;
  scrollUpDistance = 2;
  direction = ""
  start: number = 0;
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
    const req = {
      "orgId": [this.orgName],
      "searchFilters": {
        "locale": [
          "en"
        ],
        "pageSize": this.sum,
        "query": "all",
        "didYouMean": true,
        "filters": [
          {
            "andFilters": [
              {
                "contentType": [
                  "Course",
                  "Program"
                ]
              }
            ]
          }
        ],
        "visibleFilters": {
          "learningMode": {
            "displayName": "Mode"
          },
          "duration": {
            "displayName": "Duration"
          },
          "exclusiveContent": {
            "displayName": "Costs"
          },
          "complexityLevel": {
            "displayName": "Level"
          },
          "catalogPaths": {
            "displayName": "Catalog",
            "order": [
              {
                "_key": "asc"
              }
            ]
          },
          "sourceShortName": {
            "displayName": "Source"
          },
          "resourceType": {
            "displayName": "Format"
          },
          "region": {
            "displayName": "Region"
          },
          "concepts": {
            "displayName": "Concepts"
          },
          "lastUpdatedOn": {
            "displayName": "Published Date"
          }
        },
        "includeSourceFields": [
          "creatorLogo"
        ],
        "sort": [
          {
            "lastUpdatedOn": "desc"
          }
        ]
      }
    }
    this.orgService.getDatabyOrgId(req).subscribe((response: any) => {
      this.courseData = response.result
      this.totalHits = response.totalHits
      this.addItems(this.start, this.sum)
    })
  }


  addItems(index: number, sum: number) {
    for (let i = index; i < sum; ++i) {
      this.array.push(this.courseData[i])
    }
  }

  onScrollDown() {
    alert('scrolled down!!')
    // add another 20 items
    this.start = this.sum
    if (this.totalHits > this.sum) {
      this.sum += 20
    } else {
      this.sum = this.totalHits - this.sum
    }

    this.getCourses()
    this.direction = "down"
  }
}
