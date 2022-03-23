import { Component, OnInit, Input } from '@angular/core'

@Component({
  selector: 'ws-mobile-course-view',
  templateUrl: './mobile-course-view.component.html',
  styleUrls: ['./mobile-course-view.component.scss']
})
export class MobileCourseViewComponent implements OnInit {

  @Input() courseData: any
  constructor() { }

  ngOnInit() {
    console.log(this.courseData)
  }

}
