import { Component, Input, OnChanges , OnInit } from '@angular/core'
import { ContentProgressService } from './content-progress.service'

@Component({
  selector: 'ws-widget-content-progress',
  templateUrl: './content-progress.component.html',
  styleUrls: ['./content-progress.component.scss'],
})
export class ContentProgressComponent implements OnInit, OnChanges {
  @Input()
  contentId = ''

  @Input()
  progress = 0

  @Input()
  forPreview = false

  constructor(private progressSvc: ContentProgressService) {}

  ngOnInit() {
    if (this.progress) {
      this.progress = this.progress * 100
      this.progress = Number(parseFloat(String(this.progress)).toFixed(0))
    }
  }
  ngOnChanges() {
    if (this.contentId && !this.progress && !this.forPreview) {
      this.progressSvc.getProgressFor(this.contentId).subscribe(data => {
        this.progress = data
        if (this.progress) {
          this.progress = Math.round(this.progress * 10000) / 100
        }
      })
    }
  }
}
