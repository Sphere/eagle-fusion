import { forkJoin } from 'rxjs'
import { DomSanitizer } from '@angular/platform-browser'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { EditorService } from '@ws/author/src/lib/routing/modules/editor/services/editor.service'
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core'
import { template1Data, template2Data } from './template.constant'

@Component({
  selector: 'ws-auth-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss'],
})

export class TemplateComponent implements OnInit {

  selectedIndex = 0
  totalContent = 0
  currentIndex = 0
  query = 'all'
  error = false
  noData = false
  selected = '1'
  contents: NSContent.IContentMeta[] = [] as any
  @Input() isSubmitPressed = false
  @Input() currentContent = ''
  @Output() data = new EventEmitter<any>()
  constructor(
    private editorService: EditorService,
    private loader: LoaderService,
    private accessService: AccessControlService,
    private sanitizer: DomSanitizer,
  ) { }

  send(index: number) {
    this.data.emit(index === 1 ? null : index === 2 ? template1Data : template2Data)
  }

  ngOnInit() {
  }

  onIndexChange(index: number) {
    this.selectedIndex = index
    if (index === 1 && this.contents.length === 0) {
      this.fetchContent()
    }
  }

  fetchContent(loadMore = false) {
    if (loadMore) {
      this.currentIndex = this.currentIndex + 1
    }
    const searchBody = {
      request:
      {
        query: this.query,
        filters: {
          status: ['Live'],
          isRejected: [false],
          contentType: ['Channel'],
        },
        pageNo: this.currentIndex,
        sort: [{ lastUpdatedOn: 'desc' }],
        pageSize: 30,
        uuid: this.accessService.userId,
        rootOrg: this.accessService.rootOrg,
      },
    }
    this.loader.changeLoad.next(true)
    this.editorService.searchContent(searchBody).subscribe(
      data => {
        if (
          data && data.result && data.result.response &&
          data.result.response.result && data.result.response.result.length
        ) {
          this.contents.push(...(data.result.response.result || []))
        }
        this.totalContent = data.result.response.totalHits
        this.loader.changeLoad.next(false)
        if (this.contents.length === 0) {
          this.noData = true
        }
      },
      () => {
        this.error = true
        this.loader.changeLoad.next(false)
      },
    )
  }

  fetchJson(url: string, id: string) {
    this.loader.changeLoad.next(true)
    forkJoin([
      this.editorService.copy(this.currentContent, url),
      this.editorService.readJSON(url),
    ]).subscribe(
      ([_msg, data]) => {
        const regex = new RegExp(id, 'gm')
        this.data.emit(
          JSON.parse(JSON.stringify(data).replace(regex, this.currentContent.replace('.img', ''))).pageLayout,
        )
        this.loader.changeLoad.next(false)
      },
      () => {
        this.error = true
        this.loader.changeLoad.next(false)
      },
    )
  }

  generateBackGroundImage(url: string) {
    return this.sanitizer.bypassSecurityTrustStyle(`url(/apis/authContent/${encodeURIComponent(url)})`)
  }

}
