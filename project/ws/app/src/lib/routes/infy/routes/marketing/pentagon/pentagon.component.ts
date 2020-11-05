import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core'

@Component({
  selector: 'ws-app-pentagon',
  templateUrl: './pentagon.component.html',
  styleUrls: ['./pentagon.component.scss'],
})
export class PentagonComponent implements OnInit, OnChanges {
  pentagonTracks: string[] = ['Accelerate', 'Innovate', 'Insight', 'Experience', 'Assure']
  svgFileName = 'Pentagon'
  @Output()
  trackClicked = new EventEmitter()
  @Input()
  default = ''
  @Input()
  pillar = ''
  constructor() { }

  ngOnInit() {
    if (this.default) {
      this.onTrackClicked(this.pentagonTracks.indexOf(this.default))
    }
  }

  ngOnChanges() {
    this.svgFileName = 'Pentagon'
    if (this.pillar) {
      const idx = this.pentagonTracks.indexOf(this.pillar)
      if (idx > -1) {
        this.svgFileName = `Pentagon_${this.pentagonTracks[idx]}`
      }
    }
  }

  onTrackClicked(idx: any) {
    this.svgFileName = `Pentagon_${this.pentagonTracks[idx]}`

    // //console.log('Pentagon pillar', this.pentagonTracks[idx])
    setTimeout(() => {
      this.trackClicked.emit(this.pentagonTracks[idx])
    },         0)
    // this.pentagonTracks = this.rotate(this.pentagonTracks, idx)
  }
}
