import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core'
import { ENTER, COMMA, SEMICOLON } from '@angular/cdk/keycodes'
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { WidgetContentService } from '@ws-widget/collection'

@Component({
  selector: 'ws-admin-ids-request',
  templateUrl: './ids-request.component.html',
  styleUrls: ['./ids-request.component.scss'],
})
export class IdsRequestComponent implements OnInit {

  @Input()
  preSelectedIds!: string[]

  @Output()
  idsRequest = new EventEmitter<any>()

  readonly separatorKeysCodes: number[] = [ENTER, COMMA, SEMICOLON]
  selectedIds = new Set<string>()
  selectedContentMeta: any[] = []
  isFetchingMeta = false
  constructor(
    private widgetContentSvc: WidgetContentService,
  ) { }

  ngOnInit() {
    if (this.preSelectedIds) {
      this.selectedIds = new Set(this.preSelectedIds)
      this.fetchContentMeta()
    }
  }

  fetchContentMeta() {
    if (this.selectedIds.size) {
      this.isFetchingMeta = true
      this.widgetContentSvc.fetchMultipleContent(Array.from(this.selectedIds)).toPromise()
        .then(meta => {
          this.selectedContentMeta = meta
        }).catch()
        .finally(() => {
          this.isFetchingMeta = false
        })
    }
  }

  save() {
    const request = {
      ids: Array.from(this.selectedIds),
    }
    this.idsRequest.emit(request)
  }

  updateSelectedIds(e: any) {
    if (e.content) {
      if (e.checked) {
        this.selectedIds.add(e.content.identifier)
        this.selectedContentMeta.push(e.content)
      } else {
        this.selectedIds.delete(e.content.identifier)
        for (let i = 0; i < this.selectedContentMeta.length; i += 1) {
          if (this.selectedContentMeta[i].identifier === e.content.identifier) {
            this.selectedContentMeta.splice(i, 1)
          }
        }
      }
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    const temp = Array.from(this.selectedIds)
    moveItemInArray(temp, event.previousIndex, event.currentIndex)
    moveItemInArray(this.selectedContentMeta, event.previousIndex, event.currentIndex)
    this.selectedIds = new Set<string>(temp)
  }
}
