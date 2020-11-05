import { Component, OnInit, Input } from '@angular/core'

@Component({
  selector: 'ws-widget-completion-spinner',
  templateUrl: './completion-spinner.component.html',
  styleUrls: ['./completion-spinner.component.scss'],
})
export class CompletionSpinnerComponent implements OnInit {

  @Input()
  completed = 0
  @Input()
  outOf = 0
  constructor() { }

  ngOnInit() {
  }

}
