import { Component, Input, OnInit, OnChanges } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'
import { responsiveSuffix, sizeSuffix } from '@ws-widget/collection/src/public-api'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { WIDGET_LIBRARY } from '../../../constants/widet'
import { IWidgetAuthor, tDimensions, tSize } from './../../../interface/widget'
import { ChannelResolverService } from './../../../services/resolver.service'
import { ChannelStoreService } from './../../../services/store.service'

interface IAuthorGrid {
  id: string
  className: string
  styles: { [key: string]: string }
  isEmpty: boolean
}

@Component({
  selector: 'ws-auth-renderer-v2',
  templateUrl: './renderer-v2.component.html',
  styleUrls: ['./renderer-v2.component.scss'],
})
export class RendererV2Component implements OnInit, OnChanges {
  @Input() id = ''
  @Input() isSubmitPressed = false
  widget!: IWidgetAuthor
  containerClass = ''
  processedWidgets!: IAuthorGrid[][]
  emptyRows = 0
  constructor(
    private store: ChannelStoreService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private renderService: ChannelResolverService,
  ) { }

  ngOnInit() {
    this.store.update.subscribe((id: string) => {
      if (id === this.id) {
        this.initiate()
      }
    })
  }

  ngOnChanges() {
    this.initiate()
  }

  initiate() {
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
        isEmpty: child.widgetSubType ? false : true,
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
    node.dimensions = {
      small: 12,
      medium: 12,
      large: 12,
      xLarge: 12,
    }
    let index = 0
    if (rowNo) {
      for (let i = 0; i < rowNo; i = i + 1) {
        index = index + this.processedWidgets[i].length
      }
    }
    this.store.insertNewNode(node, rowNo ? index : undefined, rowNo ? true : false)
  }

  dragover_handler(ev: any, _index: number) {
    ev.preventDefault()
    ev.dataTransfer.dropEffect = 'copy'
  }

  drop_handler(ev: any, index: number) {
    ev.preventDefault()
    const data = ev.dataTransfer.getData('text/plain')
    let id = ''
    if (
      this.processedWidgets[index].length === 1 &&
      this.store.getUpdatedContent(this.processedWidgets[index][0].id).widgetSubType === ''
    ) {
      id = this.processedWidgets[index][0].id
      this.store.addWidget(id, data)
      this.initiate()
    } else {
      let totalSize = 0
      const currentSize = WIDGET_LIBRARY[data as keyof typeof WIDGET_LIBRARY] as any
      let isMultiStripPresent = false
      let otherStrip = false
      this.processedWidgets[index].forEach(v => {
        const content = this.store.getUpdatedContent(v.id)
        if (content.widgetSubType === 'contentStripMultiple') {
          isMultiStripPresent = true
        } else {
          otherStrip = true
        }
        totalSize =
          totalSize + Math.max((content.dimensions as any).xLarge || 0, (content.dimensions as any).large || 0)
      })
      if (totalSize + Math.max(currentSize.dimensions.xLarge, currentSize.dimensions.large) > 12) {
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.RESOLUTION_MISMATCH,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        return
      }
      if ((isMultiStripPresent && currentSize.widgetSubType !== 'contentStripMultiple') ||
        (otherStrip && currentSize.widgetSubType === 'contentStripMultiple')) {
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.MULTI_STRIP_VIOLATION,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
        // return // to remove restriction for adding content strip
      }
      const child = this.renderService.renderFromJSON({} as any)
      const node = child[Object.keys(child)[0]]
      id = node.id
      node.parent = this.id
      node.rowNo = index
      this.store.insertNewNode(node, null, false, false)
      this.store.addWidget(id, data)
      this.initiate()
    }

    setTimeout(() => {
      this.triggerEdit(id)
      // tslint:disable-next-line: align
    }, 10)
  }

  triggerDelete(id: string | number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '210px',
      data: 'delete',
    })

    dialogRef.afterClosed().subscribe((confirm: any) => {
      if (confirm) {
        if (typeof id === 'string') {
          this.store.deleteNode(id)
        } else {
          this.processedWidgets[id as number].map(v => {
            this.store.deleteNode(v.id, false)
            this.initiate()
          })
        }
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      }
    })
  }

  swapPosition(type: string, id: string | number) {
    this.store.swapPosition(type, id as string, this.id)
    this.initiate()
  }
}
