import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'

@Component({
    standalone: false,
    selector: 'ws-auth-search-template',
    templateUrl: './search-template.component.html',
    styleUrls: ['./search-template.component.scss'],
    
})
export class SearchTemplateComponent implements OnInit {

  @Input() content!: any
  @Output() data = new EventEmitter<any>()
  constructor() { }

  ngOnInit() {
  }

}
