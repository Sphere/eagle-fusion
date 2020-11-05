import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'viewer-interactive-exercise',
  templateUrl: './interactive-exercise.component.html',
  styleUrls: ['./interactive-exercise.component.scss'],
})
export class InteractiveExerciseComponent implements OnInit {
  forPreview = window.location.href.includes('/author/')

  constructor() {}

  ngOnInit() {}
}
