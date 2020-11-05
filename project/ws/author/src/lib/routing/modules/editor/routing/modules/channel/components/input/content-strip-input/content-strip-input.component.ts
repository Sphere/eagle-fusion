import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'ws-auth-content-strip-input',
  templateUrl: './content-strip-input.component.html',
  styleUrls: ['./content-strip-input.component.scss'],
})
export class ContentStripInputComponent implements OnInit {

  @Input() isSubmitPressed = false
  @Input() identifier = ''
  @Input() content!: any[]
  @Output() data = new EventEmitter<{ content: any, isValid: boolean }>()
  constructor() { }

  ngOnInit() {
    this.data.emit({
      content: this.content,
      isValid: true,
    })
  }

  update(data: any) {
    this.content = data
    this.data.emit({
      content: this.content,
      isValid: true,
    })
  }

}
