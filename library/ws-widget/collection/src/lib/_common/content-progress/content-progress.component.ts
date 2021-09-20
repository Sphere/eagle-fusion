import { Component, HostBinding, Input, OnInit, OnChanges } from '@angular/core'
import { ContentProgressService } from './content-progress.service'

@Component({
  selector: 'ws-widget-content-progress',
  templateUrl: './content-progress.component.html',
  styleUrls: ['./content-progress.component.scss'],
  /* tslint:disable */
  host: {
    // Sets the role for this component to "progressbar"
    role: 'progressbar',
    // Sets the minimum and maximum values for the progressbar role.
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    'title': 'progress',
    // Binding that updates the current value of the progressbar.
    '[attr.aria-valuenow]': 'progress',
  },
  /* tslint:enable */
})
export class ContentProgressComponent implements OnInit, OnChanges {
  @Input()
  contentId = ''

  @Input()
  progress = 0

  @Input()
  progressType = ''

  @Input()
  forPreview = false

  @Input()
  className = ''

  rendom = Math.random()
  @HostBinding('id')
  public id = `progress_${Math.random()}`
  constructor(private progressSvc: ContentProgressService) {
    if (this.contentId) {
      this.id = this.contentId
    }
  }

  ngOnInit() {
    this.progressSvc.getProgressFor(this.contentId).subscribe(data => {
      this.progress = data
      if (this.progress) {
        this.progress = Math.round(this.progress * 10000) / 100
      }
    })
  }

  ngOnChanges() {
    if (this.contentId && !this.progress && !this.forPreview) {
      this.progressSvc.getProgressFor(this.contentId).subscribe(data => {
          console.log(data)
        this.progress = data
        if (this.progress) {
          this.progress = Math.round(this.progress * 10000) / 100
        }
      })
    }

    if (this.progress) {
      if (this.progressType === 'percentage') {
        this.progress = this.progress
      } else {
        this.progress = Math.round(this.progress * 10000) / 100
      }
    }
  }
}
