import { Component, OnInit, Input } from '@angular/core'

@Component({
    standalone: false,
    selector: 'ws-auth-status-display',
    templateUrl: './status-display.component.html',
    styleUrls: ['./status-display.component.scss'],
    
})
export class StatusDisplayComponent implements OnInit {
  @Input() status = ''
  @Input() needStyle = true
  constructor() {}

  ngOnInit() {}
}
