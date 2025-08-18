import { Injectable } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { NsWidgetResolver } from '@ws-widget/resolver/src/public-api'
import { BehaviorSubject } from 'rxjs'
import { IWidgetAuthor } from '../interface/widget'
import { EditorContentService } from './../../../../services/editor-content.service'
import { InputComponent } from './../components/input/input/input.component'
import { InputV2Component } from './../components/v2/input-v2/input-v2.component'
import { WIDGET_LIBRARY } from './../constants/widet'
import { ChannelResolverService } from './resolver.service'

@Injectable()
export class ChannelStoreService {
  originalContent: { [key: string]: { [key: string]: IWidgetAuthor } } = {} as any
  updatedContent: { [key: string]: { [key: string]: IWidgetAuthor } } = {} as any
  public update = new BehaviorSubject<string>('')
  public editMode: 'Advanced' | 'Basic' = 'Basic'
  constructor(
    private contentService: EditorContentService,
    public matDialog: MatDialog,
    private resolver: ChannelResolverService,
  ) { }

  getUpdatedContent(id = ''): IWidgetAuthor {
    let contentId = id
    if (!contentId) {
      contentId = Object.keys(this.originalContent[this.contentService.currentContent]).find(
        v => !this.originalContent[this.contentService.currentContent][v].parent,
      ) as string
    }
    return JSON.parse(
      JSON.stringify({
        ...this.originalContent[this.contentService.currentContent][contentId],
        ...(this.updatedContent[this.contentService.currentContent] &&
          this.updatedContent[this.contentService.currentContent][contentId]
          ? this.updatedContent[this.contentService.currentContent][contentId]
          : {}),
      }),
    )
  }

  getUpdatedJSON(): { [key: string]: IWidgetAuthor } {
    return this.updatedContent[this.contentService.currentContent]
      ? {
        ...this.originalContent[this.contentService.currentContent],
        ...this.updatedContent[this.contentService.currentContent],
      }
      : this.originalContent[this.contentService.currentContent]
  }

  updateContent(id: string, data: IWidgetAuthor, push = true) {
    if (this.updatedContent[this.contentService.currentContent]) {
      this.updatedContent[this.contentService.currentContent][id] = JSON.parse(JSON.stringify(data))
    } else {
      this.updatedContent[this.contentService.currentContent] = {
        [id]: JSON.parse(JSON.stringify(data)),
      }
    }
    if (push) {
      this.update.next(id)
    }
  }

  resetContent() {
    this.originalContent[this.contentService.currentContent] = JSON.parse(
      JSON.stringify({
        ...this.originalContent[this.contentService.currentContent],
        ...this.updatedContent[this.contentService.currentContent],
      }),
    )
    delete this.updatedContent[this.contentService.currentContent]
  }

  isValid(): boolean {
    const data = this.getUpdatedJSON()
    let returnValue = true
    Object.keys(data).map(v => {
      if (!data[v].isValid) {
        returnValue = false
      }
    })
    return returnValue
  }

  triggerEdit(id: string) {
    const data = this.getUpdatedContent(id)
    if (this.editMode === 'Advanced') {
      const dialogRef = this.matDialog.open(InputComponent, {
        width: '1000px',
        data: {
          identifier: this.contentService.currentContent,
          widget: data,
          parentType: data.parent ? this.getUpdatedContent(data.parent).widgetSubType : '',
        },
      })

      dialogRef.afterClosed().subscribe({
        next: (result: IWidgetAuthor) => {
          if (result) {
            this.updateContent(result.id, result)
            this.update.next(result.parent)
          }
        },
      })
    } else {
      const dialogRef = this.matDialog.open(InputV2Component, {
        width: '1000px',
        data: {
          identifier: this.contentService.currentContent,
          widget: JSON.parse(JSON.stringify(this.resolver.renderToJSON(this.getUpdatedJSON(), id))),
          size: Math.max((data.dimensions as any).large || 12, (data.dimensions as any).xLarge || 12) / 3,
        },
      })

      dialogRef.afterClosed().subscribe({
        next: (result: NsWidgetResolver.IRenderConfigWithAnyData) => {
          if (result) {
            let newData = this.resolver.renderFromJSON(result)
            let newId = ''
            Object.keys(newData).forEach(v => {
              if (!newData[v].parent) {
                newId = v
              }
            })
            const idReplace = new RegExp(newId, 'gm')
            newData = JSON.parse(JSON.stringify(newData).replace(idReplace, id))
            data.children.forEach(v => this.deleteNode(v, false))
            data.data = newData[id].data
            data.widgetHostClass = newData[id].widgetHostClass || ''
            data.widgetHostStyle = newData[id].widgetHostStyle || {}
            data.children = newData[id].children
            data.addOnData = newData[id].addOnData
            newData[id] = data
            if (newData[id].widgetHostStyle && (newData[id].widgetHostStyle || {}).height) {
              newData[id].styles = {
                ...(newData[id].styles || {}),
                height: (newData[id].widgetHostStyle || {}).height,
              }
            } else {
              delete (newData[id].styles || {}).height
              delete (newData[id].widgetHostStyle || {}).height
            }
            if (newData[id].widgetHostStyle && (newData[id].widgetHostStyle || {}).width) {
              newData[id].styles = {
                ...(newData[id].styles || {}),
                width: (newData[id].widgetHostStyle || {}).width,
              }
            } else {
              delete (newData[id].styles || {}).width
              delete (newData[id].widgetHostStyle || {}).width
            }
            Object.keys(newData).forEach(v => this.updateContent(v, newData[v], false))
            this.update.next(data.parent)
          }
        },
      })
    }
  }

  deleteNode(id: string, canTrigger = true) {
    const recursiveDelete = (contentId: string) => {
      const content = this.getUpdatedContent(contentId)
      if (content.children && content.children.length) {
        content.children.map(v => recursiveDelete(v))
      }
      delete this.originalContent[this.contentService.currentContent][contentId]
      if (
        this.updatedContent[this.contentService.currentContent] &&
        this.updatedContent[this.contentService.currentContent][contentId]
      ) {
        delete this.updatedContent[this.contentService.currentContent][contentId]
      }
    }
    const node = this.getUpdatedContent(id)
    const parent = this.getUpdatedContent(node.parent)
    const childIndex = parent.children.indexOf(id)
    recursiveDelete(id)
    if (parent.widgetSubType === 'gridLayout') {
      const childNodes: IWidgetAuthor[] = []
      parent.children.map(v => {
        const child = this.getUpdatedContent(v)
        if (child.rowNo === node.rowNo && v !== node.id) {
          childNodes.push(child)
        }
      })
      // if (childNodes.length) {
      //   const size: any = Math.round(12 / childNodes.length) || 1
      //   childNodes.map(v => {
      //     this.updateContent(
      //       v.id,
      //       {
      //         ...v,
      //         dimensions: {
      //           ...v.dimensions,
      //           xLarge: size,
      //           large: size,
      //         } as any,
      //       },
      //       false,
      //     )
      //   })
      // }
      const elderSibling =
        childIndex > 0
          ? this.getUpdatedContent(parent.children[childIndex - 1]).rowNo === node.rowNo
          : false
      const youngerSibling =
        childIndex < parent.children.length - 1
          ? this.getUpdatedContent(parent.children[childIndex + 1]).rowNo === node.rowNo
          : false
      if (!elderSibling && !youngerSibling) {
        for (let i = childIndex + 1; i < parent.children.length; i = i + 1) {
          const child = this.getUpdatedContent(parent.children[i])
          child.rowNo = child.rowNo - 1
          this.updateContent(child.id, child, false)
        }
      }
    }
    parent.children.splice(childIndex, 1)
    this.updateContent(parent.id, parent, false)
    if (canTrigger) {
      this.update.next(parent.id)
    }
  }

  addWidget(id: string, type: keyof typeof WIDGET_LIBRARY) {
    let content = this.getUpdatedContent(id)
    const widgetData = JSON.parse(JSON.stringify(WIDGET_LIBRARY[type]))
    if (
      widgetData.widgetData &&
      Object.keys(widgetData.widgetData).length &&
      ['selectorResponsive', 'galleryView'].indexOf(widgetData.widgetSubType) > -1
    ) {
      let newData = this.resolver.renderFromJSON(widgetData)
      let newId = ''
      Object.keys(newData).forEach(v => {
        if (!newData[v].parent) {
          newId = v
        }
      })
      const idReplace = new RegExp(newId, 'gm')
      newData = JSON.parse(JSON.stringify(newData).replace(idReplace, id))
      newData[id].dimensions = widgetData.dimensions
      newData[id].rowNo = content.rowNo
      newData[id].widgetHostClass = widgetData.widgetHostClass
      newData[id].widgetHostStyle = widgetData.widgetHostStyle
      newData[id].parent = content.parent
      Object.keys(newData).forEach(v => this.updateContent(v, newData[v], false))
      this.update.next(id)
    } else {
      content = {
        ...content,
        ...widgetData,
      }
      this.updateContent(id, content)
    }
  }

  insertNewNode(
    data: IWidgetAuthor,
    index: number | null = null,
    isRow = false,
    changeSize = false,
  ) {
    const parent = this.getUpdatedContent(data.parent)
    if (parent.widgetSubType === 'gridLayout' && !isRow) {
      const childNodes: IWidgetAuthor[] = []
      parent.children.map(v => {
        const child = this.getUpdatedContent(v)
        if (child.rowNo === data.rowNo) {
          childNodes.push(child)
        }
      })
      if (changeSize) {
        const size: any = Math.round(12 / (childNodes.length + 1)) || 1
        childNodes.map(v => {
          this.updateContent(
            v.id,
            {
              ...v,
              dimensions: {
                ...v.dimensions,
                xLarge: size,
                large: size,
              } as any,
            },
            false,
          )
        })
        data.dimensions = {
          xLarge: size,
          large: size,
        } as any
      }
    } else if (parent.widgetSubType === 'gridLayout' && isRow) {
      parent.children.map(v => {
        const child = this.getUpdatedContent(v)
        if (child.rowNo >= data.rowNo) {
          child.rowNo = child.rowNo + 1
          this.updateContent(child.id, child, false)
        }
      })
    }
    this.updateContent(data.id, data, false)
    if (index) {
      parent.children.splice(index, 0, data.id)
    } else {
      parent.children.push(data.id)
    }
    this.updateContent(parent.id, parent)
  }

  swapPosition(type: string, id: string | number, parentId: string) {
    const parent = this.getUpdatedContent(parentId)
    if (typeof id === 'string') {
      const rowNo = this.getUpdatedContent(id).rowNo
      let totalLength = 0
      const rowIndex = parent.children.indexOf(id)
      let startPosition = -1
      let childIndex = 0
      parent.children.map((v, i) => {
        if (v === id) {
          childIndex = totalLength
        }
        const child = this.getUpdatedContent(v)
        if (child.rowNo === rowNo) {
          if (startPosition < 0) {
            startPosition = i
          }
          totalLength = totalLength + 1
        }
      })
      switch (type) {
        case 'moveRight':
          if (childIndex < totalLength - 1) {
            const temp = parent.children[rowIndex + 1]
            parent.children[rowIndex + 1] = id
            parent.children[rowIndex] = temp
          } else {
            parent.children.splice(startPosition, 0, id)
            parent.children.splice(rowIndex + 1, 1)
          }
          break

        case 'moveLeft':
          if (childIndex !== 0) {
            const temp = parent.children[rowIndex - 1]
            parent.children[rowIndex - 1] = id
            parent.children[rowIndex] = temp
          } else {
            parent.children.splice(startPosition + totalLength, 0, id)
            parent.children.splice(rowIndex, 1)
          }
          break
      }
    } else if (typeof id === 'number') {
      let maxIndex = 0
      const childArray: string[][] = []
      parent.children.map(v => {
        const child = this.getUpdatedContent(v)
        if (child.rowNo > maxIndex) {
          maxIndex = child.rowNo
        }
        if (childArray[child.rowNo]) {
          childArray[child.rowNo].push(child.id)
        } else {
          childArray[child.rowNo] = [child.id]
        }
      })
      switch (type) {
        case 'moveTop':
          if (id !== 0) {
            for (let i = 0; i < parent.children.length; i = i + 1) {
              const child = this.getUpdatedContent(parent.children[i])
              if (child.rowNo === id) {
                child.rowNo = id - 1
                this.updateContent(child.id, child, false)
              } else if (child.rowNo === id - 1) {
                child.rowNo = id
                this.updateContent(child.id, child, false)
              }
            }
          } else {
            for (let i = 0; i < parent.children.length; i = i + 1) {
              const child = this.getUpdatedContent(parent.children[i])
              if (child.rowNo === id) {
                child.rowNo = maxIndex
                this.updateContent(child.id, child, false)
              } else {
                child.rowNo = child.rowNo - 1
                this.updateContent(child.id, child, false)
              }
            }
          }
          if (id !== 0) {
            const temp = childArray[id - 1]
            childArray[id - 1] = childArray[id]
            childArray[id] = temp
          } else {
            const temp = childArray[maxIndex]
            childArray[maxIndex] = childArray[id]
            childArray[id] = temp
          }
          break
        case 'moveBottom':
          if (id !== maxIndex) {
            for (let i = 0; i < parent.children.length; i = i + 1) {
              const child = this.getUpdatedContent(parent.children[i])
              if (child.rowNo === id) {
                child.rowNo = id + 1
                this.updateContent(child.id, child, false)
              } else if (child.rowNo === id + 1) {
                child.rowNo = id
                this.updateContent(child.id, child, false)
              }
            }
          } else {
            for (let i = 0; i < parent.children.length; i = i + 1) {
              const child = this.getUpdatedContent(parent.children[i])
              if (child.rowNo === id) {
                child.rowNo = 0
                this.updateContent(child.id, child, false)
              } else {
                child.rowNo = child.rowNo + 1
                this.updateContent(child.id, child, false)
              }
            }
          }
          if (id !== maxIndex) {
            const temp = childArray[id + 1]
            childArray[id + 1] = childArray[id]
            childArray[id] = temp
          } else {
            const temp = childArray[0]
            childArray[0] = childArray[id]
            childArray[id] = temp
          }
          break
      }
      parent.children = ([] as string[]).concat.apply([], childArray)
    }
    this.updateContent(parent.id, parent, false)
  }
}
