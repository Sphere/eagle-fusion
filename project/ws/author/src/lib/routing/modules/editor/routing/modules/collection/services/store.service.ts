import { Injectable } from '@angular/core'
import { LoggerService } from '@ws-widget/utils'
import { DEPTH_RUE } from '@ws/author/src/lib/constants/depth-rule'
import { IAllowedType } from '@ws/author/src/lib/interface/collection-child-config'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { ICreateEntity } from '@ws/author/src/lib/interface/create-entity'
import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
import { EditorService } from '@ws/author/src/lib/routing/modules/editor/services/editor.service'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { BehaviorSubject, ReplaySubject } from 'rxjs'
import { IContentNode, IContentTreeNode } from './../interface/icontent-tree'
import { CollectionResolverService } from './resolver.service'

interface IProcessedError {
  id: string | number
  name: string
  message: string[]
}
@Injectable()
export class CollectionStoreService {
  parentNode: string[] = []
  invalidIds: number[] = []

  onInvalidNodeChange = new ReplaySubject<number[]>()
  /**
   * Map from flat node to nested node. This helps us finding the nested node to be modified
   */
  flatNodeMap = new Map<number, IContentNode>()

  /**
   * Map for unique id and lex id. This helps us finding the lex id of the node
   */
  uniqueIdMap = new Map<number, string>()

  /**
   * Map for Lex id with unique id. This helps us tracking the change
   */
  lexIdMap = new Map<string, number[]>()

  changedHierarchy: any = {}

  currentParentNode!: number
  currentSelectedNode!: number

  constructor(
    private contentService: EditorContentService,
    private editorService: EditorService,
    private resolver: CollectionResolverService,
    private authInitService: AuthInitService,
    private logger: LoggerService,
  ) {}

  treeStructureChange = new BehaviorSubject<IContentNode | null>(null)
  selectedNodeChange = new BehaviorSubject<number | null>(null)
  get selectedNode() {
    return this.selectedNodeChange.value
  }

  allowDrop(dragNode: IContentTreeNode, dropNode: IContentTreeNode): boolean {
    let allow = true
    if (!dragNode.editable || !dropNode.editable) {
      allow = false
    } else if (!this.authInitService.collectionConfig.childrenConfig[dropNode.category]) {
      allow = false
    } else if (
      !this.resolver.hasAccess(
        this.contentService.getUpdatedMeta(dropNode.identifier),
        dropNode.parentId
          ? this.contentService.getUpdatedMeta(
              (this.flatNodeMap.get(dropNode.parentId) as IContentNode).identifier,
            )
          : undefined,
      )
    ) {
      allow = false
    } else if (
      this.authInitService.collectionConfig.maxDepth <=
      dropNode.level + DEPTH_RUE[dragNode.category]
    ) {
      allow = false
    }
    return allow
  }

  dragAndDrop(
    dragNode: IContentTreeNode | IContentNode,
    dropNode: IContentTreeNode,
    adjacentId?: number,
    dropLocation: 'above' | 'below' = 'below',
    emitChange = true,
  ) {
    const oldParentNode = dragNode.parentId ? this.flatNodeMap.get(dragNode.parentId) : undefined
    const newParentNode = this.flatNodeMap.get(dropNode.id) as IContentNode
    const oldParentChildList = oldParentNode ? (oldParentNode.children as IContentNode[]) : []
    const newParentChildList = newParentNode.children as IContentNode[]
    oldParentChildList.splice(
      oldParentChildList.findIndex(v => v.id === dragNode.id),
      1,
    )
    const childNode = this.flatNodeMap.get(dragNode.id) as IContentNode
    childNode.parentId = dropNode.id
    if (adjacentId) {
      const dropPosition =
        (dropNode.children || []).indexOf(adjacentId) + (dropLocation === 'above' ? -1 : 1)
      const children = newParentNode.children as IContentNode[]
      children.splice(dropPosition, 0, childNode)
    } else {
      if (newParentChildList) {
        newParentChildList.push(childNode)
      } else {
        newParentNode.children = [childNode]
      }
    }
    if (oldParentNode) {
      this.changedHierarchy[oldParentNode.identifier] = {
        root: this.parentNode.includes(oldParentNode.identifier),
        children: oldParentChildList.map(v => {
          const child = {
            identifier: v.identifier,
            reasonAdded: 'Added from Authoring Tool',
            childrenClassifiers: [],
          }
          return child
        }),
      }
    }
    this.changedHierarchy[newParentNode.identifier] = {
      root: this.parentNode.includes(newParentNode.identifier),
      children: newParentChildList.map(v => {
        const child = {
          identifier: v.identifier,
          reasonAdded: 'Added from Authoring Tool',
          childrenClassifiers: [],
        }
        return child
      }),
    }
    if (emitChange) {
      this.treeStructureChange.next(this.treeStructureChange.value)
    }
  }

  async addChildOrSibling(
    ids: string[],
    dropNode: IContentTreeNode,
    adjacentId?: number,
    dropLocation: 'above' | 'below' = 'below',
  ): Promise<boolean> {
    try {
      const contents = await this.editorService.readMultipleContent(ids).toPromise()
      const contentDataMap = new Map<string, NSContent.IContentMeta>()
      contents.map((v, index) => {
        this.contentService.setOriginalMeta(v)
        const treeStructure = this.resolver.buildTreeAndMap(
          v,
          contentDataMap,
          this.flatNodeMap,
          this.uniqueIdMap,
          this.lexIdMap,
        )
        this.dragAndDrop(
          treeStructure,
          dropNode,
          adjacentId,
          dropLocation,
          index === ids.length - 1,
        )
      })
      return true
    } catch (ex) {
      this.logger.error(ex)
      return false
    }
  }

  async createChildOrSibling(
    type: string,
    dropNode: IContentTreeNode,
    adjacentId?: number,
    dropLocation: 'above' | 'below' = 'below',
  ): Promise<boolean> {
    try {
      const meta = this.authInitService.creationEntity.get(type) as ICreateEntity
      const requestBody = {
        name: 'Untitled Content',
        description: '',
        mimeType: meta.mimeType,
        contentType: meta.contentType,
        resourceType: meta.resourceType,
        locale:
          // tslint:disable-next-line: ter-computed-property-spacing
          this.contentService.originalContent[
            (this.flatNodeMap.get(this.currentParentNode) as IContentNode).identifier
            // tslint:disable-next-line: ter-computed-property-spacing
          ].locale || 'en',
        ...(meta.additionalMeta || {}),
      }
      const content = await this.editorService.createAndReadContent(requestBody).toPromise()
      this.contentService.setOriginalMeta(content)
      const contentDataMap = new Map<string, NSContent.IContentMeta>()
      const treeStructure = this.resolver.buildTreeAndMap(
        content,
        contentDataMap,
        this.flatNodeMap,
        this.uniqueIdMap,
        this.lexIdMap,
      )
      this.dragAndDrop(treeStructure, dropNode, adjacentId, dropLocation)
      return true
    } catch (ex) {
      this.logger.error(ex)
      return false
    }
  }

  deleteNode(id: number) {
    const deleteIds = this.resolver.getFlatHierarchy(id, this.flatNodeMap, false)
    const node = this.flatNodeMap.get(id) as IContentNode
    const parentNode = node.parentId ? this.flatNodeMap.get(node.parentId) : undefined

    deleteIds.forEach(v => {
      this.flatNodeMap.delete(v)
      const lexId = this.uniqueIdMap.get(v) as string
      this.uniqueIdMap.delete(v)
      const uniqueIds = this.lexIdMap.get(lexId) as number[]
      if (uniqueIds.length > 1) {
        uniqueIds.splice(
          uniqueIds.findIndex(currId => v === currId),
          1,
        )
      } else {
        this.lexIdMap.delete(lexId)
        delete this.contentService.originalContent[lexId]
        delete this.contentService.upDatedContent[lexId]
        delete this.changedHierarchy[lexId]
      }
    })

    if (parentNode) {
      const children = parentNode.children || []
      children.splice(
        children.findIndex(v => v.id === id),
        1,
      )

      this.changedHierarchy[parentNode.identifier] = {
        root: this.parentNode.includes(parentNode.identifier),
        children: children.map(v => {
          const child = {
            identifier: v.identifier,
            reasonAdded: 'Added from Authoring Tool',
            childrenClassifiers: [],
          }
          return child
        }),
      }
    }
    this.treeStructureChange.next(this.treeStructureChange.value)
  }

  cascadeDown(id: number, value: any, field: string, single = false): boolean {
    const dependantIds = this.resolver.getFlatHierarchy(id, this.flatNodeMap, true)
    if (dependantIds.length <= 1) {
      return false
    }
    dependantIds
      .filter(v => v !== id)
      .forEach(v => {
        const lexId = this.uniqueIdMap.get(v) as string
        if (single) {
          // tslint:disable-next-line: ter-computed-property-spacing
          let meta = this.contentService.getUpdatedMeta(lexId)[
            field as keyof NSContent.IContentMeta
            // tslint:disable-next-line: ter-computed-property-spacing
          ]
          if (meta) {
            meta.push(value)
          } else {
            meta = [value]
          }
          this.contentService.setUpdatedMeta(
            ({ field: meta } as unknown) as NSContent.IContentMeta,
            lexId,
          )
        } else {
          this.contentService.setUpdatedMeta(
            ({ field: value } as unknown) as NSContent.IContentMeta,
            lexId,
          )
        }
      })
    return true
  }

  validationCheck(id: number): IProcessedError[] | null {
    const returnValue: Map<number, IProcessedError> = new Map<number, IProcessedError>()
    const errorIds = new Set<number>()
    const hierarchy = this.resolver.getFlatHierarchy(id, this.flatNodeMap)
    this.metaValidationCheck(hierarchy, errorIds, returnValue)
    this.hierarchyStructureCheck(hierarchy, errorIds, returnValue)
    this.onInvalidNodeChange.next(Array.from(errorIds))
    return returnValue.size ? Array.from(returnValue.values()) : null
  }

  hierarchyStructureCheck(
    ids: number[],
    errorId: Set<number>,
    errorMap: Map<number, IProcessedError>,
  ) {
    ids.forEach(v => {
      const contentNode = this.flatNodeMap.get(v) as IContentNode
      const category = contentNode.category as any
      const childConfig = this.authInitService.collectionConfig.childrenConfig[category]
      const errorMsg: string[] = []
      const lexId = this.uniqueIdMap.get(v) as string
      const content = this.contentService.getUpdatedMeta(lexId)

      let currNode = contentNode
      let currentLevel = 0
      while (currNode.parentId) {
        currentLevel = currentLevel + 1
        currNode = this.flatNodeMap.get(currNode.parentId) as IContentNode
      }
      const excessLevel =
        DEPTH_RUE[contentNode.category] +
        currentLevel -
        this.authInitService.collectionConfig.maxDepth
      if (excessLevel > 0) {
        errorMsg.push(
          `Breached maximum level of depth allowed. It should be ${excessLevel} level above`,
        )
      }

      if (childConfig) {
        const allowedTypes = childConfig.childTypes
        const childTypeMap: number[] = allowedTypes.map(() => 0)
        const children = contentNode.children || []
        if (childConfig.minChildren && children.length < childConfig.minChildren) {
          errorMsg.push(
            `Minimum ${childConfig.minChildren} children is required. But ${
              children.length ? children.length : 'nothing'
            } present`,
          )
        }
        if (childConfig.maxChildren && children.length > childConfig.maxChildren) {
          errorMsg.push(
            `Maximum ${childConfig.minChildren} children is allowed. But ${children.length} present`,
          )
        }
        children.forEach((child: IContentNode, position: number) => {
          const childContent = this.contentService.getUpdatedMeta(child.identifier)
          let canPresent = false
          allowedTypes.forEach((element: IAllowedType, index: number) => {
            const canAllow = this.contentService.checkConditionV2(childContent, element.conditions)
            if (canAllow) {
              canPresent = true
              childTypeMap[index] = childTypeMap[index] + 1
              if (element.position === 'n' && position !== children.length - 1) {
                let isSameChild = true
                children.slice(position).forEach(sibling => {
                  const siblingChild = this.contentService.getUpdatedMeta(sibling.identifier)
                  isSameChild = this.contentService.checkConditionV2(
                    siblingChild,
                    element.conditions,
                  )
                  if (!isSameChild) {
                    errorMsg.push(`${childContent.name || 'Untitled Content'} should be last child`)
                    return
                  }
                })
              }
              return
            }
          })
          if (!canPresent) {
            errorMsg.push(`${childContent.name || 'Untitled Content'} is not allowed to add here`)
          }
        })
        allowedTypes.forEach((type: IAllowedType, index: number) => {
          if (type.minimum && childTypeMap[index] < type.minimum) {
            errorMsg.push(
              `Minimum ${type.minimum} contents of type ${this.formStringFromCondition(
                type.conditions,
              )} is required. But only ${childTypeMap[index]} is present`,
            )
          }
          if (type.maximum && type.maximum < childTypeMap[index]) {
            errorMsg.push(
              `Maximum ${type.maximum} contents of type ${this.formStringFromCondition(
                type.conditions,
              )} is allowed. But ${childTypeMap[index]} is present`,
            )
          }
        })
      } else if (contentNode.children && contentNode.children.length) {
        errorMsg.push(`Should not contain any child. But ${contentNode.children.length} were added`)
      }
      this.populateErrorMsg(v, errorMsg, content, errorId, errorMap)
    })
  }

  formStringFromCondition(condition: any): string {
    let returnValue = ''
    if (condition.fit) {
      condition.fit.forEach((subCondition: any, majorIndex: number) => {
        Object.keys(subCondition).forEach((v: any, index: number) => {
          returnValue = `${returnValue}${majorIndex > 0 ? ' or ' : ''}${
            index > 0 ? ' ' : ''
          }${v} in ${subCondition[v].join(' or ')}`
        })
      })
    }
    return returnValue
  }

  metaValidationCheck(ids: number[], errorId: Set<number>, errorMap: Map<number, IProcessedError>) {
    ids.forEach(v => {
      const errorMsg: string[] = []
      const lexId = this.uniqueIdMap.get(v) as string
      const content = this.contentService.getUpdatedMeta(lexId)
      if (!this.contentService.isValid(lexId)) {
        errorMsg.push('Mandatory fields are missing')
      }
      if (content.category === 'Resource') {
        if (content.mimeType === 'application/html' && !content.artifactUrl && !content.body) {
          errorMsg.push('Provide URL or populate "Body" field')
        } else if (
          ['application/pdf', 'application/x-mpegURL'].includes(content.mimeType) &&
          !content.artifactUrl
        ) {
          errorMsg.push('Upload file')
        }
      }
      this.populateErrorMsg(v, errorMsg, content, errorId, errorMap)
    })
  }

  populateErrorMsg(
    id: number,
    errorMsg: string[],
    content: NSContent.IContentMeta,
    errorId: Set<number>,
    errorMap: Map<number, IProcessedError>,
  ) {
    if (errorMsg.length) {
      errorId.add(id)
      if (errorMap.has(id)) {
        // tslint:disable-next-line: semicolon    // tslint:disable-next-line: whitespace
        ;(errorMap.get(id) as IProcessedError).message = (errorMap.get(
          id,
        ) as IProcessedError).message.concat(errorMsg)
      } else {
        errorMap.set(id, {
          id,
          name: content.name || 'Untitled Content',
          message: errorMsg,
        })
      }
    }
  }
}
