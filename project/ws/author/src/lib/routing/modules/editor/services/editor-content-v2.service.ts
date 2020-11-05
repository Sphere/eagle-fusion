import { NSContent } from '@ws/author/src/lib/interface/content'
import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject'
// const sizeof = require('object-sizeof')

interface IHierarchyData {
  [key: string]: {
    identifier: string
    reasonAdded: string
    childrenClassifiers: string[]
  }
}
@Injectable()
export class EditorContentV2Service {
  contentMetaMap = new Map<string, NSContent.IContentMeta>()
  updatedHierarchy: IHierarchyData = {}
  contentDataMap = new Map<string, any>()
  updatedMetaMap = new Map<string, NSContent.IContentMeta>()
  updatedDataSet = new Set<string>()
  parentContent: string[] = []
  changeActiveCont = new BehaviorSubject<string>('')
  changeActiveParentCont = new BehaviorSubject<string>('')
  onContentChange = new BehaviorSubject<string>('')
  onDataChange = new BehaviorSubject<string>('')
  constructor() {}

  // isSizeExceedsLimit(): boolean {
  //   const totalSize: { [key: string]: any } = {}
  //   Array.from(this.updatedDataSet).forEach(v => {
  //     totalSize[v] = this.contentDataMap.get(v)
  //   })
  //   const size: number = sizeof(totalSize)
  //   return size > 200000
  // }
}
