export class TodoItemNode {
  children!: TodoItemNode[]
  name!: string
}

export interface ITodoItemFlatNode {
  name: string
  level: number
  expandable: boolean
  identifier: string
  nodeId: string
  path: string
  checkable: boolean
}

export interface ICatalog {
  identifier: string
  name: string
  isFromPref: boolean
  nodeId: string
  path: string
  level: number
  child: ICatalog[]
}
