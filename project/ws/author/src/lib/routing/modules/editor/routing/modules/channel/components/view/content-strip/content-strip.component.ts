import { Component, OnInit, Input, OnChanges } from '@angular/core'
import { IWidgetAuthor } from './../../../interface/widget'
import { ChannelStoreService } from './../../../services/store.service'
import { ChannelResolverService } from './../../../services/resolver.service'

interface IContentStripWidgetMap {
  error: string
  noData: string
  widgets: string[]
}
@Component({
  selector: 'ws-auth-content-strip',
  templateUrl: './content-strip.component.html',
  styleUrls: ['./content-strip.component.scss'],
})

export class ContentStripComponent implements OnInit, OnChanges {

  @Input() id = ''
  @Input() isSubmitPressed = false
  @Input() showData: 'data' | 'error' | 'loader' | 'noData' = 'data'
  widget!: IWidgetAuthor
  widgetMap!: IContentStripWidgetMap

  constructor(
    private renderService: ChannelResolverService,
    private store: ChannelStoreService,
  ) { }

  ngOnChanges() {
    this.initiate()
  }

  ngOnInit() {
    this.store.update.subscribe(
      (id: string) => {
        if (id === this.id) {
          this.initiate()
        }
      },
    )
  }

  initiate() {
    this.widgetMap = {
      error: '',
      noData: '',
      widgets: [],
    }
    this.widget = this.store.getUpdatedContent(this.id)
    this.widget.children.map(
      v => {
        switch (this.store.getUpdatedContent(v).purpose) {
        case 'noDataWidget':
          this.widgetMap.noData = v
          break
        case 'errorWidget':
          this.widgetMap.error = v
          break
        default:
          this.widgetMap.widgets.push(v)
          break
        }
      },
    )
    if (!this.widgetMap.widgets.length) {
      const data = this.renderService.renderFromJSON({} as any)
      const node = data[Object.keys(data)[0]]
      node.parent = this.id
      node.purpose = 'holder'
      this.widget.children.push(node.id)
      this.store.updateContent(node.id, node, false)
      this.store.updateContent(this.id, this.widget, false)
      setTimeout(
        () => {
          this.store.triggerEdit(node.id)
        },
        10)
    }
  }

  triggerEdit(id: string) {
    this.store.triggerEdit(id)
  }

}
