import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core'
import { IIntranetSelector } from '@ws-widget/collection/src/lib/intranet-selector/intranet-selector.model'

@Component({
  selector: 'ws-auth-intranet-selector',
  templateUrl: './intranet-selector.component.html',
  styleUrls: ['./intranet-selector.component.scss'],
})
export class IntranetSelectorComponent implements OnInit, OnChanges {

  @Input() content!: IIntranetSelector
  @Input() identifier = ''
  @Input() isSubmitPressed = false
  @Input() size: 1 | 2 | 3 | 4 = 1
  @Output() data = new EventEmitter<{ content: IIntranetSelector; isValid: boolean }>()
  iframeSrc = ''
  constructor() { }

  ngOnInit() {

  }

  ngOnChanges() {
    if (this.content.isIntranet &&
      this.content.isIntranet.widget &&
      this.content.isIntranet.widget.widgetData) {
      this.iframeSrc = this.content.isIntranet.widget.widgetData.iframeSrc || ''
    }
  }

  update(value: any) {
    if (this.content.isIntranet &&
      this.content.isIntranet.widget &&
      this.content.isIntranet.widget.widgetData) {
      this.content.isIntranet.widget.widgetData.iframeSrc = value
      this.data.emit({
        content: this.content,
        isValid: this.content.isIntranet.widget.widgetData.iframeSrc ? true : false,
      })
    }

  }

}
