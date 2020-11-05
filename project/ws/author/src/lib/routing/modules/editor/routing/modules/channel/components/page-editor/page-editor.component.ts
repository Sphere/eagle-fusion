import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { EditorContentService } from './../../../../../services/editor-content.service'
import { ChannelStoreService } from './../../services/store.service'
import { MatDrawer } from '@angular/material'

@Component({
  selector: 'ws-auth-page-editor',
  templateUrl: './page-editor.component.html',
  styleUrls: ['./page-editor.component.scss'],
})
export class PageEditorComponent implements OnInit {
  @Input() isSubmitPressed = false
  parentId = ''
  @Input() canShowMode = false
  @Input() mode: 'Basic' | 'Advanced' = 'Basic'
  @Output() data = new EventEmitter<string>()
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
    this.parentId = this.store.getUpdatedContent().id
  }

  dragstart_handler(ev: any, data: string) {
    ev.dataTransfer.setData('text/plain', data)
  }
}
