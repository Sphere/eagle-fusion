import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { ENTER, COMMA } from '@angular/cdk/keycodes'
import { FormControl } from '@angular/forms'
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatSnackBar } from '@angular/material'
import { ActivatedRoute, Data, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { NsError, ROOT_WIDGET_CONFIG, NsDiscussionForum, WsDiscussionForumService } from '@ws-widget/collection'
import { TFetchStatus, ConfigurationsService, NsPage } from '@ws-widget/utils'
import { WsSocialService } from '../../../../../services/ws-social.service'

@Component({
  selector: 'ws-app-qna-edit',
  templateUrl: './qna-edit.component.html',
  styleUrls: ['./qna-edit.component.scss'],
})
export class QnaEditComponent implements OnInit, OnDestroy {

  private routeSubscription: Subscription | null = null
  qnaConversation!: NsDiscussionForum.IPostResult
  qnaRequest!: NsDiscussionForum.IPostRequest
  errorFetchingTimeline = false
  errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    widgetData: {
      errorType: 'internalServer',
    },
  }

  isCreatingPost = false
  editMode: 'create' | 'update' | 'draft' = 'create'
  title: string | undefined
  toggleTitleInfo = false
  toggleTagsInfo = false
  abstract: string | undefined
  body: string | undefined
  updatedBody: string | undefined
  actionButtonsEnabled = false

  postPublishRequest: NsDiscussionForum.IPostPublishRequest = {
    postKind: NsDiscussionForum.EPostKind.QUERY,
    postCreator: '',
    postContent: {
      title: '',
      abstract: '',
      body: '',
    },
    tags: [],
    source: {
      id: '',
      name: NsDiscussionForum.EDiscussionType.SOCIAL,
    },
  }

  postUpdateRequest: NsDiscussionForum.IPostUpdateRequest = {
    editor: '',
    meta: {
      abstract: '',
      body: '',
      title: '',
    },
    postKind: NsDiscussionForum.EPostKind.QUERY,
  }

  separatorKeysCodes: number[] = [ENTER, COMMA]
  tagsCtrl = new FormControl()
  selectedTags: NsDiscussionForum.IPostTag[] = []
  autocompleteAllTags: NsDiscussionForum.IPostTag[] = []
  tagsFromConversation: NsDiscussionForum.IPostTag[] = []
  fetchTagsStatus: TFetchStatus | undefined
  userId = ''

  @ViewChild('tagsInput', { static: true }) tagsInput!: ElementRef<HTMLInputElement>
  @ViewChild('auto', { static: true }) matAutocomplete!: MatAutocomplete
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private discussionSvc: WsDiscussionForumService,
    private socialSvc: WsSocialService,
    private configSvc: ConfigurationsService,
    private matSnackBar: MatSnackBar,
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
    this.postPublishRequest.postCreator = this.userId
    this.postUpdateRequest.editor = this.userId
    this.tagsCtrl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
      )
      .subscribe((value: string) => {
        if (value && value.length) {
          this.autocompleteAllTags = []
          this.fetchTagsStatus = 'fetching'
          this.socialSvc.fetchAutoComplete(value).subscribe(
            tags => {
              if (configSvc.restrictedFeatures && !configSvc.restrictedFeatures.has('tags-social')) {
                tags.push({
                  id: '',
                  name: value,
                })
              }
              this.autocompleteAllTags = tags || []
              this.fetchTagsStatus = 'done'
            },
            () => {
              this.fetchTagsStatus = 'error'
            },
          )
        }
      })
  }

  ngOnInit() {
    this.initData()
  }
  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
  }
  private initData() {
    this.ngOnDestroy()
    this.routeSubscription = this.activatedRoute.data.subscribe((response: Data) => {
      if (response.resolveData) {
        if (response.resolveData.error) {
          this.errorFetchingTimeline = true
        } else {
          this.qnaRequest = response.resolveData.data.request
          this.qnaConversation = response.resolveData.data.response
          if (this.qnaConversation.mainPost.postCreator.postCreatorId !== this.userId) {
            this.router.navigate(['error-access-forbidden'])
            return
          }
          if (this.qnaConversation.mainPost.status === 'Draft') {
            this.editMode = 'draft'
          } else {
            this.editMode = 'update'
          }
          this.abstract = this.qnaConversation.mainPost.postContent.abstract
          this.body = this.qnaConversation.mainPost.postContent.body
          this.title = this.qnaConversation.mainPost.postContent.title
          this.selectedTags = [...this.qnaConversation.mainPost.tags]
          this.tagsFromConversation = [...this.qnaConversation.mainPost.tags]
        }
      }
    })
  }

  publishPost(publishMsg: string, errorMsg: string) {
    this.isCreatingPost = true
    this.postPublishRequest.postContent = {
      title: this.title || '',
      abstract: this.abstract || '',
      body: this.updatedBody || '',
    }
    if (this.editMode === 'draft') {
      this.postPublishRequest.id = this.qnaRequest.postId
      this.postPublishRequest.source = this.qnaConversation.mainPost.source
      this.postPublishRequest.dateCreated = this.qnaConversation.mainPost.dtCreated
    } else {
      this.postPublishRequest.source = {
        id: '',
        name: NsDiscussionForum.EDiscussionType.SOCIAL,
      }
    }
    this.postPublishRequest.tags = this.selectedTags
    this.discussionSvc.publishPost(this.postPublishRequest).subscribe(
      data => {
        this.openSnackBar(publishMsg)
        this.isCreatingPost = false
        if (data && data.id) {
          this.router.navigate(['app', 'social', 'qna', data.id])
        } else {
          this.router.navigate(['app', 'social', 'qna'])
        }
      },
      () => {
        this.openSnackBar(errorMsg)
        this.isCreatingPost = false
      },
    )
  }

  saveDraft(successMsg: string, errorMsg: string) {
    const request: NsDiscussionForum.IPostPublishRequest = {
      postKind: NsDiscussionForum.EPostKind.QUERY,
      postCreator: this.userId,
      postContent: {
        title: this.title || '',
        abstract: this.abstract || '',
        body: this.updatedBody || '',
      },
      tags: this.selectedTags,
      source: {
        id: '',
        name: NsDiscussionForum.EDiscussionType.SOCIAL,
      },
    }
    if (this.qnaConversation) {
      request.dateCreated = this.qnaConversation.mainPost.dtCreated
      request.id = this.qnaConversation.mainPost.id
    }
    this.isCreatingPost = true
    this.socialSvc.draftPost(request).subscribe(
      () => {
        this.openSnackBar(successMsg)
        this.isCreatingPost = false
        this.router.navigate(['app', 'social', 'qna'])
      },
      () => {
        this.openSnackBar(errorMsg)
        this.isCreatingPost = false
      },
    )
  }

  update(successMsg: string, errorMsg: string) {
    this.isCreatingPost = true
    this.postUpdateRequest.meta = {
      title: this.title || '',
      abstract: this.abstract || '',
      body: this.updatedBody || '',
    }
    this.postUpdateRequest.id = this.qnaRequest.postId
    const removedTags = []
    const addedTags = []
    for (let i = 0; i < this.tagsFromConversation.length; i += 1) {
      if (!this.selectedTags.map(tag => tag.id).includes(this.tagsFromConversation[i].id)) {
        removedTags.push(this.tagsFromConversation[i])
      }
    }
    for (let i = 0; i < this.selectedTags.length; i += 1) {
      if (!this.tagsFromConversation.map(tag => tag.id).includes(this.selectedTags[i].id)) {
        addedTags.push(this.selectedTags[i])
      }
    }
    this.postUpdateRequest.addTags = addedTags
    this.postUpdateRequest.removeTags = removedTags
    this.discussionSvc.updatePost(this.postUpdateRequest).subscribe(
      () => {
        this.openSnackBar(successMsg)
        this.isCreatingPost = false
        this.router.navigate(['app', 'social', 'qna', this.qnaRequest.postId])
      },
      () => {
        this.openSnackBar(errorMsg)
        this.isCreatingPost = false
      },
    )
  }

  removeTag(tag: NsDiscussionForum.IPostTag): void {
    const index = this.selectedTags.findIndex(pTag => pTag.id === tag.id)

    if (index >= 0) {
      this.selectedTags.splice(index, 1)
    }
  }

  selectTag(event: MatAutocompleteSelectedEvent, duplicateMsg: string, invalidMsg: string): void {
    if (!this.selectedTags.map(tag => tag.name).includes((event.option.viewValue || '').trim())) {
      if (this.autocompleteAllTags.map(tag => tag.name).includes(event.option.viewValue)) {
        this.selectedTags.push(event.option.value)
      } else {
        this.openSnackBar(invalidMsg)
      }
    } else {
      this.openSnackBar(duplicateMsg)
    }
    this.tagsInput.nativeElement.value = ''
    this.tagsCtrl.setValue(null)
  }

  onTextChange(eventData: { htmlText: string; isValid: boolean }) {
    this.actionButtonsEnabled = eventData.isValid
    this.updatedBody = eventData.htmlText
  }

  openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }

}
