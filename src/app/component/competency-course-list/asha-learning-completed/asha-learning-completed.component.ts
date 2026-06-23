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

  readonly LEVELS = [1, 2, 3, 4, 5]

  constructor(private router: Router) {}

  ngOnInit(): void {}

  get competencyName(): string {
    return this.ashaData?.levels?.[0]?.name || ''
  }

  navigateToCourse(): void {
    if (this.ashaData?.contentId) {
      this.router.navigate([`/app/toc/${this.ashaData.contentId}/overview`])
    }
  }
}
