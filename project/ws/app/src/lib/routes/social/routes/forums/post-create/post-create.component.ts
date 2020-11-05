import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatSnackBar } from '@angular/material'
import { ActivatedRoute, Router } from '@angular/router'
import { NsDiscussionForum, WsDiscussionForumService } from '@ws-widget/collection'
import { ConfigurationsService, NsPage, TFetchStatus, ValueService } from '@ws-widget/utils'
import { Observable } from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { WsSocialService } from '../../../services/ws-social.service'
import { SocialForum } from '../models/SocialForumposts.model'

@Component({
  selector: 'ws-app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss'],
})
export class PostCreateComponent implements OnInit {
  isCreatingPost = false
  conversation: any
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  postId = ''
  editMode: 'create' | 'update' | 'draft' = 'create'
  forumViewData: SocialForum.ITimelineResult | null = null
  title = ''
  abstract = ''
  body = ''
  updatedBody = ''
  actionBtnsEnabled = false

  postUpdateRequest: NsDiscussionForum.IPostUpdateRequest = {
    editor: '',
    meta: {
      abstract: '',
      body: '',
      title: '',
    },
    postKind: NsDiscussionForum.EPostKind.BLOG,
  }

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

  separatorKeysCodes: number[] = [ENTER, COMMA]
  tagsCtrl = new FormControl()
  selectedTags: NsDiscussionForum.IPostTag[] = []
  autocompleteAllTags: NsDiscussionForum.IPostTag[] = []
  tagsFromConversation: NsDiscussionForum.IPostTag[] = []
  fetchTagsStatus: TFetchStatus | null = null

  isXSmall$: Observable<boolean>
  userId = ''

  forumId = ''

  @ViewChild('tagsInput', { static: true }) tagsInput: ElementRef<HTMLInputElement> | null = null
  @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete | null = null

  constructor(
    private route: ActivatedRoute,
    public matSnackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
    private socialSvc: WsSocialService,
    private discussionSvc: WsDiscussionForumService,
    private valueSvc: ValueService,
    private router: Router,

  ) {
    if (this.configSvc.userProfile) {
      this.userId = this.configSvc.userProfile.userId || ''
    }
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
              this.autocompleteAllTags = tags
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
    this.route
      .queryParams
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        this.forumId = params['forumId']
      })
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
  update(successMsg: string, errorMsg: string) {
    this.isCreatingPost = true
    this.postUpdateRequest.editor = this.userId
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

  publishBlog(publishMsg: string, errorMsg: string) {
    this.isCreatingPost = true
    this.postPublishRequest.postContent = {
      title: this.title,
      abstract: this.abstract,
      body: this.updatedBody,
    }
    this.postPublishRequest.source.id = this.forumId
    this.postPublishRequest.source.name = NsDiscussionForum.EDiscussionType.SOCIAL
    this.postPublishRequest.tags = this.selectedTags
    this.discussionSvc.publishPost(this.postPublishRequest).subscribe(
      () => {
        this.openSnackBar(publishMsg)
        this.isCreatingPost = false
        this.router.navigate(['/app/social/forums'])
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
