import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatSnackBar } from '@angular/material'
import { ActivatedRoute, Router } from '@angular/router'
import { NsDiscussionForum, WsDiscussionForumService } from '@ws-widget/collection'
import { ConfigurationsService, NsPage, TFetchStatus, ValueService } from '@ws-widget/utils'
import { Observable } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { WsSocialService } from '../../../../services/ws-social.service'

@Component({
  selector: 'ws-app-blog-edit',
  templateUrl: './blog-edit.component.html',
  styleUrls: ['./blog-edit.component.scss'],
})
export class BlogEditComponent implements OnInit {
  isCreatingPost = false
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  postId = ''
  conversation: NsDiscussionForum.IPostResult | null = null
  editMode: 'create' | 'update' | 'draft' = 'create'

  title = ''
  abstract = ''
  body = ''
  updatedBody = ''
  actionBtnsEnabled = false

  postPublishRequest: NsDiscussionForum.IPostPublishRequest = {
    postKind: NsDiscussionForum.EPostKind.BLOG,
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
    postKind: NsDiscussionForum.EPostKind.BLOG,
  }

  separatorKeysCodes: number[] = [ENTER, COMMA]
  tagsCtrl = new FormControl()
  selectedTags: NsDiscussionForum.IPostTag[] = []
  autocompleteAllTags: NsDiscussionForum.IPostTag[] = []
  tagsFromConversation: NsDiscussionForum.IPostTag[] = []
  fetchTagsStatus: TFetchStatus | null = null

  isXSmall$: Observable<boolean>
  userId = ''

  @ViewChild('tagsInput', { static: true }) tagsInput: ElementRef<HTMLInputElement> | null = null
  @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete | null = null

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public matSnackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
    private socialSvc: WsSocialService,
    private discussionSvc: WsDiscussionForumService,
    private valueSvc: ValueService,
  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
    this.postUpdateRequest.editor = this.userId
    this.postPublishRequest.postCreator = this.userId
    this.isXSmall$ = this.valueSvc.isXSmall$
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
    this.route.paramMap.subscribe(paramMap => {
      const id = paramMap.get('id')
      if (id) {
        this.postId = id
        this.fetchPost()
      } else {
        this.editMode = 'create'
      }
    })
  }

  fetchPost() {
    const conversationRequest: NsDiscussionForum.IPostRequest = {
      postId: this.postId,
      userId: this.userId || '',
      answerId: '',
      postKind: [],
      sessionId: Date.now(),
    }
    this.discussionSvc.fetchPost(conversationRequest).subscribe(data => {
      if (data && data.mainPost) {
        this.conversation = data
        if (
          this.conversation &&
          this.conversation.mainPost.postCreator.postCreatorId !== this.userId
        ) {
          this.router.navigate(['error', 'forbidden'])
        }
        if (
          this.conversation &&
          this.conversation.mainPost.status === NsDiscussionForum.EPostStatus.DRAFT
        ) {
          this.editMode = 'draft'
        } else {
          this.editMode = 'update'
        }
        if (this.conversation) {
          this.abstract = this.conversation.mainPost.postContent.abstract
          this.body = this.conversation.mainPost.postContent.body
          this.updatedBody = this.body
          this.title = this.conversation.mainPost.postContent.title
          this.selectedTags = this.conversation.mainPost.tags
          this.tagsFromConversation = [...this.conversation.mainPost.tags]
        }
      }
    })
  }

  publishBlog(publishMsg: string, errorMsg: string) {
    this.isCreatingPost = true
    this.postPublishRequest.postContent = {
      title: this.title,
      abstract: this.abstract,
      body: this.updatedBody,
    }
    if (this.editMode === 'draft' && this.conversation) {
      this.postPublishRequest.id = this.postId
      this.postPublishRequest.source = this.conversation.mainPost.source
      this.postPublishRequest.dateCreated = this.conversation.mainPost.dtCreated
    }
    this.postPublishRequest.tags = this.selectedTags
    this.discussionSvc.publishPost(this.postPublishRequest).subscribe(
      data => {
        this.openSnackBar(publishMsg)
        this.isCreatingPost = false
        if (data && data.id) {
          this.router.navigate(['app', 'social', 'blogs', data.id])
        } else {
          this.router.navigate(['app', 'social', 'blogs', 'me', 'published'])
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
      postKind: NsDiscussionForum.EPostKind.BLOG,
      postCreator: this.userId || '',
      postContent: {
        title: this.title,
        abstract: this.abstract,
        body: this.updatedBody,
      },
      tags: this.selectedTags,
      source: {
        id: '',
        name: NsDiscussionForum.EDiscussionType.SOCIAL,
      },
    }
    if (this.conversation) {
      request.dateCreated = this.conversation.mainPost.dtCreated
      request.id = this.postId
    }
    this.isCreatingPost = true
    this.socialSvc.draftPost(request).subscribe(
      (_data: any) => {
        this.openSnackBar(successMsg)
        this.isCreatingPost = false
        this.router.navigate(['app', 'social', 'blogs', 'me', 'draft'])
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
      title: this.title,
      abstract: this.abstract,
      body: this.updatedBody,
    }
    this.postUpdateRequest.id = this.postId
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
      (_data: any) => {
        this.openSnackBar(successMsg)
        this.isCreatingPost = false
        this.router.navigate(['../../', this.postId], { relativeTo: this.route })
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

  selectTag(event: MatAutocompleteSelectedEvent, duplicateMsg: string, invalidMsg: string) {
    if (!this.selectedTags.map(tag => tag.name).includes((event.option.value.name || '').trim())) {
      if (this.autocompleteAllTags.map(tag => tag.name).includes(event.option.value.name)) {
        this.selectedTags.push(event.option.value)
      } else {
        this.openSnackBar(invalidMsg)
      }
    } else {
      this.openSnackBar(duplicateMsg)
    }
    if (this.tagsInput) {
      this.tagsInput.nativeElement.value = ''
    }
    this.tagsCtrl.setValue(null)
  }

  onTextChange(eventData: { isValid: boolean; htmlText: string }) {
    this.actionBtnsEnabled = eventData.isValid
    this.updatedBody = eventData.htmlText
  }

  openSnackBar(message: string) {
    this.matSnackBar.open(message)
  }
}
