/**
 * IContent data with nested structure.
 * @param { string } name -  Name of the content
 * @param { number } id - unique id for the node
 * @param { string } identifier - Lex id for the content
 * @param { boolean } editable - Is it allowed to change the hierarchy of the parent
 * @param { boolean } childLoaded - Is all the children loaded or not
 * @param { IContentNode[] } children - List of children if any
 * @param { number } parentId - unique id of the parent if it has
 * @param { string } category - Category of the content
 * @param { string } icon - Mat Icon which should be displayed in tree
 * @param { string } categoryType - Category type of the content
 * @param { string } mimeType - Mimetype of the content
 */
export interface IContentNode {
  id: number
  identifier: string
  editable: boolean
  children?: IContentNode[]
  category: string
  childLoaded: boolean
  parentId?: number
}

/** Flat node with expandable and level information
 * @param { string } name -  Name of the content
 * @param { number } id - unique id for the node
 * @param { string } identifier - Lex id for the contentt
 * @param { boolean } editable - Is it allowed to change the hierarchy of the parent
 * @param { boolean } childLoaded - Is all the children loaded or not
 * @param { number[] } children - List of children unique ids if any
 * @param { number } parentId - unique id of the parent if it has
 * @param { string } category - Category of the content
 * @param { string } icon - Mat Icon which should be displayed in tree
 * @param { string } categoryType - Category type of the content
 * @param { string } mimeType - Mimetype of the content
 * @param { boolean } expandable - Is the node is expandable or not
 * @param { number } level - Depth of the node inside the hierarchy
 */
export interface IContentTreeNode {
  id: number
  identifier: string
  editable: boolean
  category: string
  childLoaded: boolean
  parentId?: number
  expandable: boolean
  level: number
  children?: number[]
}
