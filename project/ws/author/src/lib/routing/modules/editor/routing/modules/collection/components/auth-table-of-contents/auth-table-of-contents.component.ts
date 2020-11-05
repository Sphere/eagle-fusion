import { FlatTreeControl } from '@angular/cdk/tree'
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { ConfirmDialogComponent } from '@ws/author/src/lib/modules/shared/components/confirm-dialog/confirm-dialog.component'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { EditorContentService } from '../../../../../services/editor-content.service'
import { IContentNode } from '../../interface/icontent-tree'
import { AuthPickerComponent } from './../../../../../shared/components/auth-picker/auth-picker.component'
import { IContentTreeNode } from './../../interface/icontent-tree'
import { CollectionStoreService } from './../../services/store.service'
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout'
import { map } from 'rxjs/operators'
@Component({
  selector: 'ws-auth-table-of-contents',
  templateUrl: './auth-table-of-contents.component.html',
  styleUrls: ['./auth-table-of-contents.component.scss'],
})
export class AuthTableOfContentsComponent implements OnInit, OnDestroy {
  @Output() action = new EventEmitter<{ type: string; identifier: string }>()
  @Output() closeEvent = new EventEmitter<boolean>()
  treeControl!: FlatTreeControl<IContentTreeNode>
  treeFlattener!: MatTreeFlattener<IContentNode, IContentTreeNode>
  dataSource!: MatTreeFlatDataSource<IContentNode, IContentTreeNode>
  isDragging = false
  dropContainer: IContentTreeNode | null = null
  dragContainer: IContentTreeNode | null = null
  expandDelay = 500
  isDropDisabled = false
  expandTimeout: any
  draggingPosition: 'above' | 'below' | 'center' | null = null
  selectedNode: number | null = null
  expandedNodes = new Set<number>()
  parentNodeId!: number
  drawer = true
  menubtn = true
  parentHierarchy: number[] = []
  backUpInformation = {
    isDragging: false,
    dropContainer: null as any,
    dragContainer: null as any,
    draggingPosition: null as any,
  }
  invalidIds: number[] = []
  mediumScreen = false
  mediumSizeBreakpoint$ = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small])
    .pipe(map((res: BreakpointState) => res.matches))
  leftarrow = true
  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private store: CollectionStoreService,
    private editorStore: EditorContentService,
    private loaderService: LoaderService,
    private authInitService: AuthInitService,
    private breakpointObserver: BreakpointObserver,
  ) {}

  private _transformer = (node: IContentNode, level: number): IContentTreeNode => {
    return {
      level,
      id: node.id,
      identifier: node.identifier,
      category: node.category,
      expandable: !!node.children && node.children.length > 0,
      children: node.children ? node.children.map(v => v.id) : [],
      editable: node.editable,
      childLoaded: node.childLoaded,
      parentId: node.parentId,
    }
  }

  ngOnInit() {
    this.parentNodeId = this.store.currentParentNode
    this.treeControl = new FlatTreeControl<IContentTreeNode>(
      node => node.level,
      node => node.expandable,
    )

    this.treeFlattener = new MatTreeFlattener(
      this._transformer,
      node => node.level,
      node => node.expandable,
      node => node.children,
    )

    this.store.onInvalidNodeChange.subscribe(v => {
      this.invalidIds = v
      this.expandNodesById(v)
    })
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener)

    this.store.treeStructureChange.subscribe(data => {
      this.dataSource.data = [data as IContentNode]
      if (this.parentNodeId === this.store.currentParentNode) {
        this.expandNodesById()
        if (this.selectedNode && !this.store.flatNodeMap.get(this.selectedNode)) {
          this.parentHierarchy.forEach(v => {
            if (this.store.flatNodeMap.get(v)) {
              const identifier = this.store.uniqueIdMap.get(v) as string
              this.selectedNode = v
              this.editorStore.currentContent = identifier
              this.store.currentSelectedNode = v
              this.editorStore.changeActiveCont.next(identifier)
              return
            }
          })
        }
      } else {
        this.parentNodeId = this.store.currentParentNode
      }
    })
    this.store.selectedNodeChange.subscribe(data => {
      if (data) {
        this.selectedNode = data
      }
    })
    this.mediumSizeBreakpoint$.subscribe(isLtMedium => {
      this.mediumScreen = isLtMedium
      if (isLtMedium) {
        this.drawer = true
        this.leftarrow = false
        this.menubtn = false
      } else {
        this.leftarrow = true
        this.menubtn = true
      }
    })
  }

  ngOnDestroy() {
    this.loaderService.changeLoad.next(false)
  }

  onNodeSelect(node: IContentTreeNode) {
    if (node.id !== this.selectedNode) {
      this.selectedNode = node.id
      this.editorStore.currentContent = node.identifier
      this.store.currentSelectedNode = node.id
      this.editorStore.changeActiveCont.next(node.identifier)
    }
  }

  closeSidenav() {
    this.closeEvent.emit(true)
  }

  dragStart(node: IContentTreeNode) {
    this.isDragging = true
    this.dragContainer = node
  }

  dragEnd() {
    this.backUpInformation = {
      isDragging: this.isDragging,
      dropContainer: this.dropContainer,
      dragContainer: this.dragContainer,
      draggingPosition: this.draggingPosition,
    }
    this.isDragging = false
    this.dropContainer = null
    this.dragContainer = null
    this.draggingPosition = null
  }

  dragHover(node: IContentTreeNode, event: MouseEvent) {
    event.preventDefault()
    if (this.isDragging) {
      this.dropContainer = node
      clearTimeout(this.expandTimeout)
      this.expandTimeout = setTimeout(() => {
        this.treeControl.expand(node)
        // tslint:disable-next-line: align
      }, this.expandDelay)
      const percentageY = event.offsetY / (event.target as any).clientHeight
      if (percentageY >= 0 && percentageY < 0.2) {
        this.draggingPosition = 'above'
      } else if (percentageY > 0.8) {
        this.draggingPosition = 'below'
      } else if (percentageY >= 0.2 && percentageY <= 0.8) {
        this.draggingPosition = 'center'
      }
      const parentHierarchy: number[] = []
      let currNode: IContentTreeNode | null = node
      while (currNode) {
        if (currNode && currNode.parentId) {
          parentHierarchy.push(currNode.parentId)
        }
        currNode = this.getParentNode(currNode)
      }
      if (parentHierarchy.includes((this.dragContainer as IContentTreeNode).id)) {
        this.isDropDisabled = true
      } else if (this.dragContainer === this.dropContainer) {
        this.isDropDisabled = true
      } else if (['above', 'below'].includes(this.draggingPosition as string)) {
        const parentNode = this.getParentNode(node)
        this.isDropDisabled = !parentNode
          ? true
          : !this.store.allowDrop(
              this.dragContainer as IContentTreeNode,
              parentNode as IContentTreeNode,
            )
      } else {
        this.isDropDisabled = !this.store.allowDrop(
          this.dragContainer as IContentTreeNode,
          this.dropContainer as IContentTreeNode,
        )
      }
    }
  }

  dragHoverEnd($event: Event) {
    $event.preventDefault()
    if (this.isDragging) {
      clearTimeout(this.expandTimeout)
      this.backUpInformation.dropContainer = this.dropContainer as any
      this.dropContainer = null
    }
  }

  drop() {
    this.isDragging = false
    if (!this.isDropDisabled) {
      this.preserveExpandedNodes()
      const isAdjacentDrop = ['above', 'below'].includes(
        this.backUpInformation.draggingPosition as string,
      )
      const dropContainer = isAdjacentDrop
        ? this.getParentNode(this.backUpInformation.dropContainer as IContentTreeNode)
        : this.backUpInformation.dropContainer

      if (dropContainer.id !== this.backUpInformation.dragContainer.id) {
        this.store.dragAndDrop(
          this.backUpInformation.dragContainer as IContentTreeNode,
          dropContainer as IContentTreeNode,
          isAdjacentDrop ? this.backUpInformation.dropContainer.id : undefined,
          this.backUpInformation.draggingPosition,
        )
      }
    }
  }

  preserveExpandedNodes() {
    this.expandedNodes = new Set<number>()
    this.treeControl.dataNodes.forEach(v => {
      if (this.treeControl.isExpandable(v) && this.treeControl.isExpanded(v)) {
        this.expandedNodes.add(v.id)
      }
    })
  }

  expandNodesById(ids?: number[]) {
    const idSet = ids ? new Set(ids) : this.expandedNodes
    this.treeControl.dataNodes.forEach(node => {
      if (idSet.has(node.id)) {
        this.treeControl.expand(node)
        let parent = this.getParentNode(node)
        while (parent) {
          this.treeControl.expand(parent)
          parent = this.getParentNode(parent)
        }
      }
    })
  }
  /*
   Get the parent node of a node
    */
  getParentNode(node: IContentTreeNode): IContentTreeNode | null {
    const currentLevel = node.level

    if (currentLevel < 1) {
      return null
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1

    for (let i = startIndex; i >= 0; i = i - 1) {
      const currentNode = this.treeControl.dataNodes[i]

      if (currentNode.level < currentLevel) {
        return currentNode
      }
    }
    return null
  }

  delete(node: IContentTreeNode) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '175px',
      data: 'deleteTreeNode',
    })
    this.preserveExpandedNodes()
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.parentHierarchy = []
        let currNode: IContentTreeNode | null = node
        while (currNode) {
          if (currNode && currNode.parentId) {
            this.parentHierarchy.push(currNode.parentId)
          }
          currNode = this.getParentNode(currNode)
        }
        this.store.deleteNode(node.id)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: Notify.SUCCESS,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      }
    })
  }

  async addChildOrSibling(node: IContentTreeNode, asSibling = false) {
    const children = (node.children || []).map(v => this.store.uniqueIdMap.get(v))
    const dialogRef = this.dialog.open(AuthPickerComponent, {
      width: '90vw',
      height: '90vh',
      data: {
        filter: this.authInitService.collectionConfig.childrenConfig[node.category].searchFilter,
        selectedIds: children,
      },
    })
    this.preserveExpandedNodes()
    dialogRef.afterClosed().subscribe(async (contents: string[]) => {
      if (contents && contents.length) {
        const parentNode = (asSibling ? this.getParentNode(node) : node) as IContentTreeNode
        this.expandedNodes.add(parentNode.id)
        this.loaderService.changeLoad.next(true)
        const isDone = await this.store.addChildOrSibling(
          contents,
          parentNode,
          asSibling ? node.id : undefined,
          'below',
        )
        this.loaderService.changeLoad.next(false)
        this.snackBar.openFromComponent(NotificationComponent, {
          data: {
            type: isDone ? Notify.SUCCESS : Notify.FAIL,
          },
          duration: NOTIFICATION_TIME * 1000,
        })
      }
    })
  }

  async createNewChildOrSibling(type: string, node: IContentTreeNode, asSibling = false) {
    const parentNode = (asSibling ? this.getParentNode(node) : node) as IContentTreeNode
    this.loaderService.changeLoad.next(true)
    this.preserveExpandedNodes()
    this.expandedNodes.add(parentNode.id)
    const isDone = await this.store.createChildOrSibling(
      type,
      parentNode,
      asSibling ? node.id : undefined,
      'below',
    )
    this.snackBar.openFromComponent(NotificationComponent, {
      data: {
        type: isDone ? Notify.SUCCESS : Notify.FAIL,
      },
      duration: NOTIFICATION_TIME * 1000,
    })
    this.loaderService.changeLoad.next(false)
  }

  takeAction(action: string, node: IContentTreeNode, type?: string) {
    switch (action) {
      case 'editMeta':
      case 'editContent':
      case 'preview':
        this.onNodeSelect(node)
        this.action.emit({ type: action, identifier: node.identifier })
        break
      case 'delete':
        this.delete(node)
        break

      case 'addChild':
        this.addChildOrSibling(node)
        break

      case 'addSibling':
        this.addChildOrSibling(node, true)
        break

      case 'createChild':
        this.createNewChildOrSibling(type as string, node)
        break

      case 'createSibling':
        this.createNewChildOrSibling(type as string, node, true)
        break

      default:
        break
    }
  }
}
