import { Injectable } from '@angular/core'
import { ICON_TYPE } from '@ws/author/src/lib/constants/icons'
import { MIME_TYPE } from '@ws/author/src/lib/constants/mimeType'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
import { NSContent } from '../../../../../../../interface/content'
import { IContentNode, IContentTreeNode } from '../interface/icontent-tree'
import { AuthInitService } from './../../../../../../../services/init.service'

@Injectable()
/**
 * The service which contains the logic to parse the collection hierarch data and produce the
 * respective tree structure or json structure
 */
export class CollectionResolverService {
  // The set to hold the content type for which the lazy loading of children is required
  lazyLoad = new Set<string>()
  private _uniqueId = 0
  constructor(
    private accessService: AccessControlService,
    private contentService: EditorContentService,
    private authInitService: AuthInitService,
  ) { }

  get uniqueId() {
    this._uniqueId += 1
    return Date.now() + this._uniqueId
  }
  /**
   * Restructure the hierarch passed from backend to a map and tree hierarch
   * which is easy to read and update the meta and tree structure
   *
   * @param { NSContent.IContentMeta } content - The hierarchy to be passed
   * @param { Map } content - The map which is used to read and populate meta data
   * @param { Map<string, NSContent.IContentMeta> } flatNodeMap - The map which is used to modify change in individual tree structure
   * @param { Map<number,string> } uniqueIdMap - The map which is used to get unique id against lex id
   *
   */
  buildTreeAndMap(
    content: NSContent.IContentMeta,
    map: Map<string, NSContent.IContentMeta>,
    flatNodeMap: Map<number, IContentNode>,
    uniqueIdMap: Map<number, string>,
    lexIdMap: Map<string, number[]>,
  ): IContentNode {
    /**
     * Recursive function which actually do the work
     *
     * @param { NSContent.IContentMeta } currContent - The hierarchy to be passed
     * @param { string[] } parentList - The parent lex ids in the hierarchy in the order of top to bottom
     * @param { boolean } editable - Whether the user have access to change the parent hierarch or not
     * @returns { IContentNode } the restructured hierarch data to load in tree
     */
    const recursiveFn = (
      currContent: NSContent.IContentMeta,
      parentId: number | undefined = undefined,
      editable = true,
    ): IContentNode => {
      const treeStructure: IContentNode = {
        editable,
        parentId,
        id: this.uniqueId,
        identifier: currContent.identifier,
        category: this.getCategory(currContent),
        childLoaded: !this.lazyLoad.has(this.getCategory(currContent)),
        children: [],
      }
      map.set(currContent.identifier, currContent)
      uniqueIdMap.set(treeStructure.id, currContent.identifier)
      const uniqueIds = lexIdMap.get(treeStructure.identifier)
      if (uniqueIds) {
        uniqueIds.push(treeStructure.id)
      } else {
        lexIdMap.set(treeStructure.identifier, [treeStructure.id])
      }
      /**
       * Checking the user have access or not
       */
      const haveAccessToChangeStructure = this.hasAccess(currContent)
      if (treeStructure.childLoaded && treeStructure.children) {
        const children: IContentNode[] = []
        currContent.children.forEach(v =>
          children.push(recursiveFn(v, treeStructure.id, haveAccessToChangeStructure)),
        )
        treeStructure.children = children
      }
      flatNodeMap.set(treeStructure.id, treeStructure)
      return treeStructure
    }

    return recursiveFn(content)
  }

  getFlatHierarchy(
    id: number,
    flatNodeMap: Map<number, IContentNode>,
    rightPermission = true,
  ): number[] {
    const returnValue: number[] = []
    const recursiveFunction = (currId: number) => {
      returnValue.push(currId)
      const node = flatNodeMap.get(currId) as IContentNode
      if ((rightPermission && node.editable) || !rightPermission) {
        const children = node.children || []
        children.map(v => recursiveFunction(v.id))
      }
    }
    recursiveFunction(id)
    return returnValue
  }

  /**
   * Since the category is not populated for old content to make it backward compatible
   * we are checking the category first if it is not present we are sending the contentType
   *
   * @param { NSContent.IContentMeta } content - The content for which we need to get category
   * @returns { string } The category
   */
  private getCategory(content: NSContent.IContentMeta): string {
    return content.category || content.contentType
  }

  /**
   * Since the categoryType is not populated for old content to make it backward compatible
   * we are checking the categoryType first if it is not present we are checking the contentType
   * and based on contentType we select resourceType or courseType
   *
   * @param { NSContent.IContentMeta } content - The content for which we need to get category
   * @returns { string } The category type
   */
  getCategoryType(content: NSContent.IContentMeta): string {
    switch (this.getCategory(content)) {
      case 'Collection':
        return ''
      default:
        return ''
    }
  }

  /**
   * To get the respective Mat icon mapping for the each contents
   * For different resources we need different types of icons
   *
   * @param { NSContent.IContentMeta } content - The content for which we need to get category
   * @returns { string } The mat icon to be displayed
   */
  getIcon(content: NSContent.IContentMeta): string {
    if (content.mimeType === MIME_TYPE.collection) {
      if (content.contentType === 'Learning Path') {
        return ICON_TYPE.program
      }
      if (content.contentType === 'Course') {
        return ICON_TYPE.course
      }
      return ICON_TYPE.learningModule
    }
    if (content.mimeType === MIME_TYPE.html) {
      if (content.resourceType === 'Certification') {
        return ICON_TYPE.certificate
      }
      if (content.isExternal) {
        return ICON_TYPE.externalContent
      }
      return ICON_TYPE.internalContent
    }
    if (content.mimeType === MIME_TYPE.pdf) {
      if (!content.artifactUrl) {
        return ICON_TYPE.emptyFile
      }
      return ICON_TYPE.pdf
    }
    if (content.mimeType === MIME_TYPE.youtube) {
      return ICON_TYPE.youtube
    }
    if (content.mimeType === MIME_TYPE.quiz) {
      if (content.resourceType === 'Assessment') {
        return ICON_TYPE.assessment
      }
      return ICON_TYPE.quiz
    }
    if (content.mimeType === MIME_TYPE.dragDrop) {
      return ICON_TYPE.dragNDrop
    }
    if (content.mimeType === MIME_TYPE.htmlPicker) {
      return ICON_TYPE.htmlPicker
    }
    if (content.mimeType === MIME_TYPE.webModule) {
      return ICON_TYPE.internalContent
    }
    if (content.mimeType === MIME_TYPE.handson) {
      return ICON_TYPE.handsOn
    }
    if (content.mimeType === MIME_TYPE.iap) {
      return ICON_TYPE.iap
    }
    if (content.mimeType === MIME_TYPE.mp3) {
      return ICON_TYPE.audio
    }
    if (content.mimeType === MIME_TYPE.mp4) {
      return ICON_TYPE.video
    }
    if (content.contentType === 'Collection') {
      return ICON_TYPE.learningModule
    }
    return ICON_TYPE.default
  }

  /**
   * To get to know the user access to change the hierarchy structure or not
   * Respective role have different access on different status of the content.
   * @param { NSContent.IContentMeta } content - The content for which we need to get category
   * @returns { boolean } The mat icon to be displayed
   */
  hasAccess(content: NSContent.IContentMeta, parentMeta?: NSContent.IContentMeta): boolean {
    return this.contentService.hasAccess(content, false, parentMeta) &&
      content.status === 'InReview'
      ? this.authInitService.collectionConfig.enabledRole.includes('reviewer')
      : content.status === 'Reviewed'
        ? this.authInitService.collectionConfig.enabledRole.includes('publisher')
        : ['Draft', 'Live'].includes(content.status)
          ? this.authInitService.collectionConfig.enabledRole.includes('author')
          : this.accessService.hasRole(['admin'])
  }

  /**
   * To know whether the drop of one node is allowed based max depth logic
   * @param { IContentTreeNode } dropNode - The node for which depth needs to be checked
   * @param { IContentTreeNode } dragNode - The node for which depth needs to be checked
   * @param { number } maxDepth - Maximum depth allowed in the configuration
   * @returns { boolean } The mat icon to be displayed
   */
  allowMaxDepth(
    _dropNode: IContentTreeNode,
    _dragNode: IContentTreeNode,
    _maxDepth: number,
  ): boolean {
    return true
  }
}
