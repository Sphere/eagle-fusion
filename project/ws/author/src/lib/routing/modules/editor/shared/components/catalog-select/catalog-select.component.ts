import { SelectionModel } from '@angular/cdk/collections'
import { FlatTreeControl } from '@angular/cdk/tree'
import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree'
import { TFetchStatus } from '@ws-widget/utils'
import { UploadService } from '../../services/upload.service'
import { ICatalog, ITodoItemFlatNode, TodoItemNode } from './models/catalog-model'

// const TREE_DATA = {
//   Groceries: {
//     'Almond Meal flour': null,
//     'Organic eggs': null,
//     'Protein Powder': null,
//     Fruits: {
//       Apple: null,
//       Berries: ['Blueberry', 'Raspberry'],
//       Orange: null,
//     },
//   },
//   Reminders: [
//     'Cook dinner',
//     'Read the Material Design spec',
//     'Upgrade Application to Angular',
//   ],
// }

@Component({
  selector: 'ws-auth-catalog-select',
  templateUrl: './catalog-select.component.html',
  styleUrls: ['./catalog-select.component.scss'],
})
export class CatalogSelectComponent implements OnInit {
  status: TFetchStatus = 'none'
  treeData = {} as any

  catalogData!: ICatalog[]
  flatCatalogData: ICatalog[] = []
  flatNodes: ITodoItemFlatNode[] = []
  selectedCatalogPaths: String[] = []
  parentPaths: String[] = []

  flatNodeMap = new Map<ITodoItemFlatNode, TodoItemNode>()
  nestedNodeMap = new Map<TodoItemNode, ITodoItemFlatNode>()
  selectedParent: ITodoItemFlatNode | null = null

  treeControl!: FlatTreeControl<ITodoItemFlatNode>
  treeFlattener!: MatTreeFlattener<TodoItemNode, ITodoItemFlatNode>
  dataSource!: MatTreeFlatDataSource<TodoItemNode, ITodoItemFlatNode>

  checklistSelection = new SelectionModel<ITodoItemFlatNode>(true)

  getLevel = (node: ITodoItemFlatNode) => node.level
  isExpandable = (node: ITodoItemFlatNode) => node.expandable
  getChildren = (node: TodoItemNode): TodoItemNode[] => node.children
  hasChild = (_: number, _nodeData: ITodoItemFlatNode) => _nodeData.expandable
  hasNoContent = (_: number, _nodeData: ITodoItemFlatNode) => _nodeData.name === ''

  constructor(
    private uploadSvc: UploadService,
    public dialogRef: MatDialogRef<CatalogSelectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: String[],
  ) {
    this.parentPaths = data
  }

  ngOnInit() {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren,
    )
    this.treeControl = new FlatTreeControl<ITodoItemFlatNode>(this.getLevel, this.isExpandable)
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener)
    this.uploadSvc.fetchCatalog().subscribe((res: any) => {
      this.catalogData = res.Common.child
      this.transformCatalogData()
      const data: TodoItemNode[] = this.buildFileTree(this.treeData, 0)
      this.dataSource.data = data
      this.status = 'done'
      this.parentPaths
        .filter(v => v !== 'Common')
        .forEach(path => {
          const currentPath = path
          // //console.log('The path now', currentPath)
          const selectedNode = this.flatNodes.find(node => {
            return node.path === currentPath
          })
          if (selectedNode) {
            this.checklistSelection.toggle(selectedNode)
          }
        })
      this.selectedCatalogPaths = this.parentPaths
    })
  }

  // function to get data from the API
  getChildData(childrens: ICatalog[]): any {
    const childData = {} as any
    childrens.forEach((child: ICatalog) => {
      this.flatCatalogData.push(child)
      const childName = child.name
      childData[childName] = null
    })
    return childData
  }

  transformCatalogData() {
    this.catalogData.forEach((data: ICatalog) => {
      this.flatCatalogData.push(data)
      const name = data.name
      const childrens = data.child
      if (childrens.length === 0) {
        this.treeData[name] = null
      } else {
        const childData = {} as any
        childrens.forEach((child: ICatalog) => {
          this.flatCatalogData.push(child)
          const childName = child.name
          const grandChildren = child.child
          if (grandChildren.length === 0) {
            childData[childName] = null
          } else {
            const grandChildData = this.getChildData(grandChildren)
            childData[childName] = grandChildData
          }
        })
        this.treeData[name] = childData
      }
    })
  }

  // transforms the treeData to treeNode
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node)
    const flatNode =
      existingNode && existingNode.name === node.name
        ? existingNode
        : {
            name: '',
            level: 0,
            expandable: false,
            identifier: '',
            path: '',
            nodeId: '',
            checkable: true,
          }
    flatNode.name = node.name
    const currentNode = this.flatCatalogData.find(r => {
      return r.name === flatNode.name
    })
    flatNode.level = level
    flatNode.expandable = !!node.children
    if (currentNode) {
      flatNode.path = currentNode.path
      flatNode.identifier = currentNode.identifier
      flatNode.nodeId = currentNode.nodeId
    }
    if (flatNode.name === 'Common') {
      flatNode.checkable = false
    }
    this.flatNodes.push(flatNode)
    this.flatNodeMap.set(flatNode, node)
    this.nestedNodeMap.set(node, flatNode)
    return flatNode
  }

  buildFileTree(obj: { [key: string]: any }, level: number): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key]
      const node = new TodoItemNode()
      node.name = key

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1)
        } else {
          node.name = value
        }
      }

      return accumulator.concat(node)
      // tslint:disable-next-line: align
    }, [])
  }

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: ITodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node)
    const descAllSelected = descendants.every(child => this.checklistSelection.isSelected(child))
    return descAllSelected
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: ITodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node)
    const result = descendants.some(child => this.checklistSelection.isSelected(child))
    return result && !this.descendantsAllSelected(node)
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: ITodoItemFlatNode): void {
    this.checklistSelection.toggle(node)

    const descendants = this.treeControl.getDescendants(node)
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants)
    this.checkAllParentsSelection(node)
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: ITodoItemFlatNode): void {
    this.checklistSelection.toggle(node)
    this.checkAllParentsSelection(node)
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: ITodoItemFlatNode): void {
    let parent: ITodoItemFlatNode | null = this.getParentNode(node)
    while (parent) {
      this.checkRootNodeSelection(parent)
      parent = this.getParentNode(parent)
    }
  }

  addNodePath(node: ITodoItemFlatNode, isParent: boolean = false) {
    const catalogPath = node.path
    const exists = this.selectedCatalogPaths.find(data => {
      return data === catalogPath
    })
    if (exists) {
      this.selectedCatalogPaths = this.selectedCatalogPaths.filter(cPath => {
        return cPath !== catalogPath
      })
      if (isParent) {
        // //console.log('removing for a parent')
        // const descendants = this.treeControl.getDescendants(node)
        // descendants.forEach(descendantNode => {
        //   this.selectedCatalogPaths = this.selectedCatalogPaths.filter(cPath => {
        //     return cPath !== descendantNode.path
        //   })
        // })
        // //console.log('The selected paths after removing children', this.selectedCatalogPaths)
      }
    } else {
      // //console.log('Adding new path ', catalogPath)
      this.selectedCatalogPaths.push(catalogPath)
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: ITodoItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node)
    const descendants = this.treeControl.getDescendants(node)
    let oneSelected = false
    const catalogPath = node.path
    const exists = this.selectedCatalogPaths.find(data => {
      return data === catalogPath
    })
    descendants.forEach(v => {
      if (this.checklistSelection.isSelected(v)) {
        oneSelected = true
      }
    })
    if (nodeSelected && !oneSelected) {
      this.checklistSelection.deselect(node)
      if (exists) {
        this.selectedCatalogPaths = this.selectedCatalogPaths.filter(cPath => {
          return cPath !== catalogPath
        })
      }
    } else {
      this.selectedCatalogPaths.push(catalogPath)
      this.checklistSelection.select(node)
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: ITodoItemFlatNode): ITodoItemFlatNode | null {
    const currentLevel = this.getLevel(node)

    if (currentLevel < 1) {
      return null
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1

    for (let i = startIndex; i >= 0; i -= 1) {
      const currentNode = this.treeControl.dataNodes[i]

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode
      }
    }
    return null
  }

  onClose() {
    const returnValue: string[] = ['Common']
    this.checklistSelection.selected.map(v => {
      if (v.path) {
        returnValue.push(v.path)
      }
    })
    this.dialogRef.close(
      this.catalogData && this.catalogData.length
        ? this.checklistSelection.selected.length
          ? returnValue
          : []
        : this.parentPaths,
    )
  }
}
