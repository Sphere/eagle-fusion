import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core'

@Component({
  selector: 'ws-widget-editor-quill',
  templateUrl: './editor-quill.component.html',
  styleUrls: ['./editor-quill.component.scss'],
})
export class EditorQuillComponent implements OnInit {
  @Output() textData = new EventEmitter<{
    isValid: boolean
    htmlText: string
  }>()

  @Input() htmlText = ''
  @Input() minLength = '1'
  @Input() post ?= false

  reset = false
  placeholder = 'Ask a question, or add something you found helpful'

  constructor() { }

  ngOnInit() {
    if (this.post) {
      this.placeholder = 'Add a post ...'
    }
  }

  onContentChanged(editorEvent: any) {
    this.textData.emit({
      isValid: editorEvent.text.length > this.minLength,
      htmlText: editorEvent.html,
    })
  }

  resetEditor() {
    this.reset = true
    setTimeout(() => {
      this.reset = false
    },         0)
  }
}
