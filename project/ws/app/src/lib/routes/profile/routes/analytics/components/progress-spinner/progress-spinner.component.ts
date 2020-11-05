import { Component, OnInit, Input } from '@angular/core'
// import { ContentProgressService } from '@ws-widget/collection'
@Component({
  selector: 'ws-app-progress-spinner',
  templateUrl: './progress-spinner.component.html',
  styleUrls: ['./progress-spinner.component.scss'],
})
export class ProgressSpinnerComponent implements OnInit {
//   @Input() contentId = ''
//   @Input() mode?: 'determinate' | 'indeterminate' = 'determinate'
//   @Input() progress?: undefined | number = undefined

//   constructor(private contentProgressSvc: ContentProgressService) {}

//   ngOnInit() {}

//   ngOnChanges() {
//     if (this.progress === undefined) {
//       this.contentProgressSvc.getProgressFor(this.contentId).subscribe(data => {
//         this.progress = data
//         if (this.progress === undefined) {
//           this.progress = 0
//         }
//       })
//     }
//   }
// }
  @Input()
  spinMode: 'determinate' | 'indeterminate' = 'indeterminate'
  @Input()
  spinSize: 'small' | 'medium' | 'large' | 'xlarge' = 'medium'
  @Input()
  spinWidth: 'thin' | 'medium' | 'thick' = 'medium'
  @Input()
  spinColor: 'primary' | 'accent' = 'accent'
  @Input()
  spinValue = 0

  spinSizeHash = {
    small: 40,
    medium: 60,
    large: 75,
    xlarge: 90,
  }
  spinWidthHash = {
    thin: 3,
    medium: 5,
    thick: 8,
  }
  constructor() { }
  ngOnInit() { }
}
