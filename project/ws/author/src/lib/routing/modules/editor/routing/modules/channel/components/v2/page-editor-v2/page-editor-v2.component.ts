import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core'
import { EditorContentService } from '@ws/author/src/lib/routing/modules/editor/services/editor-content.service'
import { ChannelStoreService } from './../../../services/store.service'
import { MatDrawer } from '@angular/material'

@Component({
  selector: 'ws-auth-page-editor-v2',
  templateUrl: './page-editor-v2.component.html',
  styleUrls: ['./page-editor-v2.component.scss'],
})
export class PageEditorV2Component implements OnInit {
  @Input() isSubmitPressed = false
  parentId = ''
  showFiller = false
  @Input() mode: 'Basic' | 'Advanced' = 'Basic'
  @Output() data = new EventEmitter<string>()
  @Input() canShowMode = false
  columnSize: 1 | 2 | 3 | 4 = 1
  @ViewChild(MatDrawer, { static: false }) drawer!: MatDrawer

  constructor(private store: ChannelStoreService, private contentService: EditorContentService) { }

  ngOnInit() {
    this.contentService.changeActiveCont.subscribe(() => this.getParent())
    this.getParent()
  }

  changeEditMode() {
    this.data.emit('editorChange')
  }

  getParent() {
    const data = this.store.getUpdatedContent()
    this.parentId = data.id
    data.data = {
      ...data.data,
      fromBasicEditor: true,
    }
    this.store.updateContent(this.parentId, { ...data }, false)

  }

  dragstart_handler(ev: any, data: string) {
    ev.dataTransfer.setData('text/plain', data)
  }
}
