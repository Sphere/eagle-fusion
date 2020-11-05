import { IWidgetAuthor } from './../../../interface/widget'
import { Component, OnInit, Input, OnChanges } from '@angular/core'
import { ChannelStoreService } from './../../../services/store.service'
import { ChannelResolverService } from './../../../services/resolver.service'

@Component({
  selector: 'ws-auth-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit, OnChanges {

  @Input() id = ''
  @Input() isSubmitPressed = false
  widget!: IWidgetAuthor
  defaultVal = 'set1'
  currentIndex = 0
  currentWidget = ''
  widgetDatas!: {
    id: string
    thumbnail: string
    title: string
    description: string
  }[]

  constructor(
    private store: ChannelStoreService,
    private renderService: ChannelResolverService,
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
    this.widgetDatas = [] as any
    this.widget = this.store.getUpdatedContent(this.id)
    if (this.widget && this.widget.data.designVal) {
      this.defaultVal = this.widget.data.designVal
    }
    if (this.widget && this.widget.children.length && this.defaultVal === 'set1') {
      this.currentWidget = (!this.currentWidget || this.widget.children.indexOf(this.currentWidget) < 0) ?
        this.widget.children[0] : this.currentWidget
      this.widget.children.map(v => {
        const data = this.store.getUpdatedContent(v)
        this.widgetDatas.push({
          id: v,
          thumbnail: data.addOnData.thumbnail,
          title: data.addOnData.title,
          description: data.addOnData.description,
        })
      })
    }
    if (this.widget && (!this.widget.children || !this.widget.children.length)) {
      const data = this.renderService.renderFromJSON({} as any)
      const node = data[Object.keys(data)[0]]
      node.parent = this.id
      this.widget.children.push(node.id)
      this.store.updateContent(node.id, node, false)
      this.store.updateContent(this.id, this.widget, false)
    }
  }

  changeWidget(id: string) {
    this.currentWidget = id
  }

  slideTo(index: number) {
    if (index >= 0 && index < this.widget.children.length) {
      this.currentIndex = index
    } else if (index === this.widget.children.length) {
      this.currentIndex = 0
    } else {
      this.currentIndex = this.widget.children.length + index
    }
  }

  triggerEdit(id: string) {
    this.store.triggerEdit(id)
  }
}
