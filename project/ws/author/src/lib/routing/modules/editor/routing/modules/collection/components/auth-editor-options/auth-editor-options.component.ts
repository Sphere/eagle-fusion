import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { DEPTH_RUE } from '@ws/author/src/lib/constants/depth-rule'
import { ICreateEntity } from '@ws/author/src/lib/interface/create-entity'
import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { ICustomCreateEntity } from './../../interface/create-menu'
import { IContentNode, IContentTreeNode } from './../../interface/icontent-tree'
import { CollectionStoreService } from './../../services/store.service'

@Component({
  selector: 'ws-auth-editor-options',
  templateUrl: './auth-editor-options.component.html',
  styleUrls: ['./auth-editor-options.component.scss'],
})
export class AuthEditorOptionsComponent implements OnInit {
  @Input() node!: IContentTreeNode
  @Input() isInvalid = true
  @Output() action = new EventEmitter<{ action: string; type?: string }>()
  creationContent!: Map<string, ICreateEntity>
  allowedChild: ICustomCreateEntity[] = []
  allowedSibling: ICustomCreateEntity[] = []
  canEdit = false
  contentEditDisabled = false
  metaEditDisabled = false

  constructor(
    private authInitService: AuthInitService,
    private accessService: EditorContentService,
    private storeService: CollectionStoreService,
  ) { }

  ngOnInit() {
    this.creationContent = this.authInitService.creationEntity
    const childrenConfig = this.authInitService.collectionConfig.childrenConfig
    const contentTypeConfig = childrenConfig[this.node.category]
    const content = this.accessService.getUpdatedMeta(this.node.identifier)
    this.contentEditDisabled = content.isContentEditingDisabled
    this.metaEditDisabled = content.isMetaEditingDisabled
    this.canEdit = this.accessService.hasAccess(content)
    if (
      contentTypeConfig &&
      this.node.editable &&
      this.canEdit &&
      contentTypeConfig.allowCreation
    ) {
      this.allowedChild = this.formChildren(contentTypeConfig, this.node.level + 1)
    }
    if (this.node.parentId) {
      const parentType = this.storeService.flatNodeMap.get(this.node.parentId) as IContentNode
      const parentContent = this.accessService.getUpdatedMeta(parentType.identifier)
      if (
        parentType &&
        childrenConfig[parentType.category] &&
        this.node.editable &&
        !parentContent.isContentEditingDisabled &&
        this.accessService.hasAccess(parentContent) &&
        childrenConfig[parentType.category].allowCreation
      ) {
        this.allowedSibling = this.formChildren(
          childrenConfig[parentType.category],
          this.node.level,
        )
      }
    }
  }

  formChildren(contentTypeConfig: any, currentDepth: number): ICustomCreateEntity[] {
    const topLevel = Array.from(this.creationContent.values())
    const child: ICustomCreateEntity[] = []
    topLevel.forEach(v => {
      if (
        !v.parent &&
        contentTypeConfig.allowedCreationType &&
        contentTypeConfig.allowedCreationType.includes(v.id) &&
        this.authInitService.collectionConfig.maxDepth >=
        currentDepth + (DEPTH_RUE[v.contentType] || 1)
      ) {
        child.push(
          this.recursiveAddFunction(v, contentTypeConfig.allowedCreationType, currentDepth),
        )
      }
    })
    return child
  }
  recursiveAddFunction(
    content: ICreateEntity,
    allowedType: string[],
    currentDepth: number,
  ): ICustomCreateEntity {
    const children: ICustomCreateEntity[] = []
    const returnValue: ICustomCreateEntity = {
      children,
      id: content.id,
      name: content.name,
      icon: content.icon,
    }
    if (content.children) {
      content.children.forEach(v => {
        const entity = this.authInitService.creationEntity.get(v)
        if (
          entity &&
          allowedType.includes(entity.id) &&
          this.authInitService.collectionConfig.maxDepth >=
          currentDepth + (DEPTH_RUE[entity.contentType] || 1)
        ) {
          children.push(this.recursiveAddFunction(entity, allowedType, currentDepth))
        }
      })
    }
    return returnValue
  }

  click(action: string, type?: string) {
    this.action.emit({ action, type })
  }
}
