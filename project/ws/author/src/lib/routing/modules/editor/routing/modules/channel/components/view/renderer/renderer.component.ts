import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { IWidgetAuthor } from './../../../interface/widget'
import { ChannelStoreService } from './../../../services/store.service'
import { ChannelResolverService } from './../../../services/resolver.service'
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  ViewChild,
  ElementRef,
} from '@angular/core'
import { MatSnackBar, MatDialog } from '@angular/material'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'

@Component({
  selector: 'ws-auth-renderer',
  templateUrl: './renderer.component.html',
  styleUrls: ['./renderer.component.scss'],
})
export class RendererComponent implements OnInit, OnChanges {

  @Input() id = ''
  @Input() isSubmitPressed = false
  event = false
  widgetData!: IWidgetAuthor
  @ViewChild('parent', { static: false }) parent!: ElementRef
  width = '0px'
  top = '0px'
  widget!: any
  parentContent = ''
  canHaveSibling = false
  canHaveChild = false
  selectorWidget!: any[]
  widgetMap!: any
  currentIndex = 0
  showData: 'data' | 'loader' | 'noData' | 'error' = 'data'
  showChildData: 'data' | 'loader' | 'noData' | 'error' | 'info' = 'data'
  constructor(
    private store: ChannelStoreService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private renderService: ChannelResolverService,
  ) { }

  ngOnInit() {
    this.store.update.subscribe(
      (id: string) => {
        if (id === this.id) {
          this.initiate()
        }
      },
    )
  }

  ngOnChanges() {
    this.initiate()
  }

  loadSelectorWidget() {
    if (this.widgetData.widgetSubType === 'selectorResponsive') {
      this.selectorWidget = []
      this.widgetData.children.map(v => {
        const childData = this.store.getUpdatedContent(v)
        this.selectorWidget.push(childData.addOnData)
      })
    }
  }

  loadContentStripWidget() {
    if (
      this.widgetData.widgetSubType === 'contentStripMultiple' ||
      (this.widgetData.widgetSubType === '' && this.widgetData.purpose === 'holder')
    ) {
      this.widgetMap = {
        info: '',
        error: '',
        noData: '',
        widgets: [],
      }
      this.widgetData.children.map(
        v => {
          switch (this.store.getUpdatedContent(v).purpose) {
          case 'noDataWidget':
            this.widgetMap.noData = v
            break
          case 'info':
            this.widgetMap.info = v
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
    }
  }

  initiate() {
    this.widgetData = this.store.getUpdatedContent(this.id)
    const parent = this.store.getUpdatedContent(this.widgetData.parent).widgetSubType
    if (['gridLayout'].indexOf(parent) > -1) {
      this.canHaveSibling = true
    }
    // else if (['preWidget', 'postWidget', 'holder'].indexOf(this.widgetData.purpose || '') > -1) {
    //   this.canHaveSibling = true
    // }
    if (['galleryView', 'selectorResponsive', 'linearLayout', 'tabLayout'].indexOf(this.widgetData.widgetSubType) > -1) {
      this.canHaveChild = true
    }
    if (this.widgetData.children.length === 0) {
      this.widget = {
        widgetSubType: this.widgetData.widgetSubType,
        widgetType: this.widgetData.widgetType,
        widgetHostClass: this.widgetData.widgetHostClass,
        widgetHostStyle: this.widgetData.widgetHostStyle,
        widgetData: this.widgetData.data,
      }
    }
    this.loadSelectorWidget()
    this.loadContentStripWidget()
  }

  triggerEdit() {
    this.store.triggerEdit(this.id)
  }

  triggerDelete() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '210px',
      data: 'delete',
    })

    dialogRef.afterClosed().subscribe((confirm: any) => {
      if (confirm) {
        this.store.deleteNode(this.id)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      }
    })
  }

  dragover_handler(ev: any) {
    ev.preventDefault()
    ev.dataTransfer.dropEffect = 'copy'
  }

  drop_handler(ev: any) {
    ev.preventDefault()
    const data = ev.dataTransfer.getData('text/plain')
    this.store.addWidget(this.id, data)
    if (data !== 'strip') {
      setTimeout(
        () => {
          this.triggerEdit()
        },
        10)
    }
  }

  generateNextNode(isChild = false, purpose = '') {
    const data = this.renderService.renderFromJSON({} as any)
    const node = data[Object.keys(data)[0]]
    node.purpose = purpose
    if (purpose === 'info') {
      node.addOnData = {
        mode: 'below',
        visibilityMode: 'hidden',
        icon: {
          icon: 'info',
          scale: 0.8,
        },
      }
    }
    if (!isChild) {
      node.parent = this.widgetData.parent
      node.rowNo = this.widgetData.rowNo
      node.purpose = this.widgetData.purpose
      this.store.insertNewNode(
        node,
        this.store.getUpdatedContent(this.widgetData.parent).children.indexOf(this.id) + 1,
      )
    } else {
      node.parent = this.id
      this.store.insertNewNode(node)
    }
    this.loadSelectorWidget()
    this.loadContentStripWidget()
    if (this.widgetData.widgetSubType === 'selectorResponsive') {
      setTimeout(
        () => {
          this.currentIndex = this.widgetData.children.length - 1
        },
        100,
      )
    } else if (
      this.widgetData.widgetSubType === 'contentStripMultiple' ||
      (this.widgetData.widgetSubType === '' && this.widgetData.purpose === 'holder')
    ) {
      setTimeout(
        () => {
          this.showData = purpose === 'noDataWidget' ? 'noData' : purpose === 'errorWidget' ? 'error' : 'data'
        },
        100,
      )
    }
  }

  toggleDefault() {
    if (this.widgetData.widgetSubType === 'errorResolver') {
      this.widgetData.widgetSubType = ''
      this.widgetData.widgetType = ''
      this.widgetData.data = {}
    } else {
      this.widgetData.widgetSubType = 'errorResolver'
      this.widgetData.widgetType = 'errorResolver'
      this.widgetData.data = {
        errorType: this.widgetData.purpose === 'noDataWidget' ? 'contentUnavailable' : 'internalServer',
      }
    }
    this.store.updateContent(this.id, this.widgetData)
  }
}
