import { Component, HostBinding, Input, OnInit, OnChanges, OnDestroy } from '@angular/core'

@Component({
    standalone: false,
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
        // Binding that updates the current value of the progressbar.
        '[attr.aria-valuenow]': 'progress',
    },
    
})
export class ContentProgressComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  contentId = ''

  @Input()
  progress: any

  @Input()
  forPreview = false

  @Input()
  className = ''

  rendom = Math.random()
  @HostBinding('id')
  public id = `progress_${Math.random()}`
  constructor() {
    if (this.contentId) {
      this.id = this.contentId
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  ngOnChanges() {
  }
}
