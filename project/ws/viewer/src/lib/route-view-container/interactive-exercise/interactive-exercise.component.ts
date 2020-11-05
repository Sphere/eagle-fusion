import { Component, OnInit, Input } from '@angular/core'

@Component({
  selector: 'viewer-interactive-exercise',
  templateUrl: './interactive-exercise.component.html',
  styleUrls: ['./interactive-exercise.component.scss'],
})
export class InteractiveExerciseComponent implements OnInit {
  @Input() forPreview = false

  constructor() {}

  ngOnInit() {}
}
