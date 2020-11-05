import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'

interface IEmbedWidget {
  title: string
  iframeSrc: string
  containerStyle?: { [key: string]: string }
  containerClass?: string
  iframeId?: string
}

@Component({
  selector: 'ws-auth-embed',
  templateUrl: './embed.component.html',
  styleUrls: ['./embed.component.scss'],
})
export class EmbedComponent implements OnInit {

  showInfo = ''
  @Input() isSubmitPressed = false
  @Input() editorType: 'advanced' | 'basic' = 'advanced'
  @Input() content!: IEmbedWidget
  @Input() forVideo = false
  @Output() data = new EventEmitter<{ content: IEmbedWidget, isValid: boolean }>()
  constructor() { }

  ngOnInit() {
    if (!this.content.iframeId) {
      this.content.iframeId = new Date().toISOString()
    }
    this.data.emit({
      content: this.content,
      isValid: this.content.iframeSrc ? true : false,
    })
  }

  update(key: string, value: any) {
    this.data.emit({
      content: {
        ...this.content,
        [key]: value,
      },
      isValid: this.content.iframeSrc ? true : false,
    })
  }

}
