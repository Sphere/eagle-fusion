import { Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  standalone: false,
  selector: 'app-asha-learning-completed',
  templateUrl: './asha-learning-completed.component.html',
  styleUrls: ['./asha-learning-completed.component.scss'],
})
export class AshaLearningCompletedComponent implements OnInit {
  @Input() ashaData: any
  @Input() completedCount = 0

  constructor(private readonly router: Router) { }

  ngOnInit(): void {
    // Intentionally empty
  }

  // navigateToCourse(): void {
  //   if (this.ashaData?.contentId) {
  //     this.router.navigate([`/app/toc/${this.ashaData.contentId}/overview`])
  //   }
  // }

  viewCourses(data) {
    if (data.competencyID) {
      this.router.navigate(['/app/search'], {
        queryParams: {
          q: [
            `${data.competencyID}-1`,
            `${data.competencyID}-2`,
            `${data.competencyID}-3`,
            `${data.competencyID}-4`,
            `${data.competencyID}-5`,
          ],
          competency: true,
          redirect: 'page/home',
        },
        queryParamsHandling: 'merge',
      })

    }
  }
}
