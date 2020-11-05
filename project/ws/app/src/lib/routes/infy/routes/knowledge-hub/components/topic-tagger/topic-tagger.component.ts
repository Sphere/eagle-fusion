import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core'
import { ENTER, COMMA } from '@angular/cdk/keycodes'
import { FormControl } from '@angular/forms'
import { MatAutocompleteSelectedEvent, MatAutocomplete, MatSnackBar } from '@angular/material'
import { distinctUntilChanged, debounceTime } from 'rxjs/operators'
import {
  ITopicTaggerAction,
  ITopicTaggerResponse,
  IKhubFetchStatus,
  IWsKhubPostTag,
} from '../../models/knowledgeHub.model'
import { KnowledgeHubService } from '../../services/knowledge-hub.service'
// import { WsSocialService } from '../../../../../social/services/ws-social.service';

@Component({
  selector: 'ws-app-infy-topic-tagger',
  templateUrl: './topic-tagger.component.html',
  styleUrls: ['./topic-tagger.component.scss'],
})
export class TopicTaggerComponent implements OnInit {
  @Input() itemType = ''
  @Input() topics: string[] = []
  @Input() showLimit = 0
  @Input() itemId = ''
  missingTopic = ''
  sliceValue = 0
  separatorKeysCodes: number[] = [ENTER, COMMA]
  tagsCtrl = new FormControl()
  selectedTags: IWsKhubPostTag[] = []
  autocompleteAllTags: IWsKhubPostTag[] = []
  fetchTagsStatus: IKhubFetchStatus = 'none'
  addTopic: ITopicTaggerAction = {
    item: this.itemId,
    topic: '',
    user: '', // this.authSvc.userId
    action: 'add',
  }
  deleteTopic: ITopicTaggerAction = {
    item: this.itemId,
    topic: '',
    user: '', // this.authSvc.userId
    action: 'delete',
  }
  respo: ITopicTaggerResponse = {} as ITopicTaggerResponse
  @ViewChild('tagsInput', { static: false }) tagsInput: ElementRef<HTMLInputElement> | null = null
  @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete | null = null
  constructor(
    // private socialSvc: WsSocialService,
    public matSnackBar: MatSnackBar,
    // private authSvc: Se,
    private khubServ: KnowledgeHubService,
  ) {
    this.tagsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
    )
      .subscribe((value: string) => {
        if (value && value.length) {
          this.autocompleteAllTags = []
          this.fetchTagsStatus = 'fetching'
          // this.socialSvc.fetchAutoComplete(value).subscribe(
          //   (tags: IWsKhubPostTag[]) => {
          //     this.autocompleteAllTags = tags || []
          //     if (tags.length === 0) {
          //       this.addTopic.topic = value
          //     }
          //     this.fetchTagsStatus = 'done'
          //   },
          //   () => {
          //     this.fetchTagsStatus = 'error'
          //   },
          // )
          // this.autocompleteAllTags = []
        }
      })
  }

  ngOnInit() {
    if (this.itemType === '' || this.itemType === undefined) {
      this.itemType = 'Project'
    }
    this.sliceValue = this.showLimit ? this.showLimit : 3
  }
  showAll() {
    try {
      this.sliceValue = this.topics.length
    } catch (e) {
      throw e
    }
  }
  removeTag(tag: IWsKhubPostTag): void {
    const index = this.selectedTags.findIndex(pTag => pTag.id === tag.id)

    if (index >= 0) {
      this.selectedTags.splice(index, 1)
    }
  }

  selectTag(event: MatAutocompleteSelectedEvent): void {
    this.selectedTags.push(event.option.value)
    this.addTopic.topic = event.option.value.name
    // this.tagsInput.nativeElement.value = ''
    this.tagsCtrl.setValue(null)
  }
  openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }

  addOrDeleteTopic(type: string, topic: string) {
    try {
      if (type === 'add') {
        this.addTopic.item = this.itemId
        this.khubServ.postTopicTaggerAction(this.addTopic).subscribe(
          data => {
            this.respo = data
            this.openSnackBar('topic submitted for approval')
            this.selectedTags = []
          },
          () => {
            this.openSnackBar('Some error occured try  later')
          },
        )
      } else if (type === 'delete') {
        this.deleteTopic.topic = topic
        this.deleteTopic.item = this.itemId
        this.khubServ.postTopicTaggerAction(this.deleteTopic).subscribe(
          data => {
            this.respo = data
            this.openSnackBar('Removal of topic submitted for approval')
          },
          () => {
            this.openSnackBar('Some error occured try  later')
          },
        )
      }
    } catch (e) {
      throw e
    }
  }
}
