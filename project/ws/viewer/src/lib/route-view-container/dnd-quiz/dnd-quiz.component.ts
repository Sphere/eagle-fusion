import { Component, OnInit, Input } from '@angular/core'

@Component({
    standalone: false,
    selector: 'viewer-dnd-quiz',
    templateUrl: './dnd-quiz.component.html',
    styleUrls: ['./dnd-quiz.component.scss'],
    
})
export class DndQuizComponent implements OnInit {
  @Input() forPreview = false

  constructor() {}

  ngOnInit() {}
}
