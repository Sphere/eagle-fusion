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

  constructor(private router: Router) {}

  ngOnInit(): void {}

  navigateToCourse(): void {
    if (this.ashaData?.contentId) {
      this.router.navigate([`/app/toc/${this.ashaData.contentId}/overview`])
    }
  }
}
