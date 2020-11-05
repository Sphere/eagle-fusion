import { ChannelResolverService } from './../../../services/resolver.service'
import { Component, OnInit, Input, OnChanges } from '@angular/core'
import { IWidgetAuthor, tDimensions, tSize } from './../../../interface/widget'
import { ChannelStoreService } from './../../../services/store.service'
import { responsiveSuffix, sizeSuffix } from '@ws-widget/collection/src/public-api'

interface IAuthorGrid {
  id: string
  className: string
  styles: { [key: string]: string }
}

@Component({
  selector: 'ws-auth-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})

export class GridComponent implements OnInit, OnChanges {

  @Input() id = ''
  hover!: boolean[]
  @Input() isSubmitPressed = false
  widget!: IWidgetAuthor
  containerClass = ''
  processedWidgets!: IAuthorGrid[][]
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
    this.hover = []
    this.processedWidgets = [] as any
    this.widget = this.store.getUpdatedContent(this.id)
    if (this.widget.data.gutter != null) {
      this.containerClass = `-mx-${this.widget.data.gutter}`
    }
    const gutterAdjustment = this.widget.data.gutter !== null ? `p-${this.widget.data.gutter}` : ''
    this.widget.children.map(row => {
      const child = this.store.getUpdatedContent(row)
      const data: IAuthorGrid = {
        id: child.id,
        className: Object.entries(child.dimensions as Record<tDimensions, tSize>).reduce(
          (agg, [k, v]) =>
            `${agg} ${(responsiveSuffix as { [id: string]: string })[k]}:${sizeSuffix[v]}`,
          `${child.className} w-full ${gutterAdjustment}`,
        ),
        styles: child.styles || {},
      }
      if (this.processedWidgets[child.rowNo]) {
        this.processedWidgets[child.rowNo].push(data)
      } else {
        this.processedWidgets[child.rowNo] = [data]
      }
    })
  }

  triggerEdit(id: string) {
    this.store.triggerEdit(id)
  }

  addRow(rowNo?: number) {
    const data = this.renderService.renderFromJSON({} as any)
    const node = data[Object.keys(data)[0]]
    node.parent = this.id
    node.rowNo = rowNo ? rowNo : this.processedWidgets.length
    let index = 0
    if (rowNo) {
      for (let i = 0; i < rowNo; i = i + 1) {
        index = index + this.processedWidgets[i].length
      }
    }
    this.store.insertNewNode(
      node,
      rowNo ? index : undefined,
      rowNo ? true : false,
    )
  }
}
