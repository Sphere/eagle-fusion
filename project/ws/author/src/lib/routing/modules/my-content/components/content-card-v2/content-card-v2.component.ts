import { StatusTrackComponent } from './../../../../../modules/shared/components/status-track/status-track.component'
import { AuthExpiryDateConfirmComponent } from '@ws/author/src/lib/modules/shared/components/auth-expiry-date-confirm/auth-expiry-date-confirm.component'
import { DraftDialogComponent } from '@ws/author/src/lib/modules/shared/components/draft-dialog/draft-dialog.component'
import { UnpublishDialogComponent } from '@ws/author/src/lib/modules/shared/components/unpublish-dialog/unpublish-dialog.component'
import { RestoreDialogComponent } from '@ws/author/src/lib/modules/shared/components/restore-dialog/restore-dialog.component'
import { ValueService } from '@ws-widget/utils'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { IAction } from './../../interface/content-card'
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { ISearchContent, ITranslation } from '@ws/author/src/lib/interface/search'
import { MatDialog } from '@angular/material'
import { DeleteDialogComponent } from '@ws/author/src/lib/modules/shared/components/delete-dialog/delete-dialog.component'

interface ILanguageBar {
  label: string
  srclang: string
}

@Component({
  selector: 'ws-auth-content-card-v2',
  templateUrl: './content-card-v2.component.html',
  styleUrls: ['./content-card-v2.component.scss'],
})
export class ContentCardV2Component implements OnInit {
  languages: ILanguageBar[] = []
  translationArray: ITranslation[] = []
  category = ''
  locale = ''
  categoryType = ''
  icon = ''
  showLanguageBar = false
  mainAction = 'edit'
  allowedActions: string[] = []
  disabledActions: string[] = []
  isMobile = false
  timeLinePerspective:
    | 'lastUpdated'
    | 'lastAction'
    | 'deleted'
    | 'lastPublished'
    | 'expires'
    | 'lastUnpublished' = 'lastUpdated'
  @Input() perspective: 'author' | 'reviewer' | 'expiry' | 'deleted' = 'author'
  @Input() content!: ISearchContent
  @Output() action = new EventEmitter<IAction>()
  constructor(
    private accessService: AccessControlService,
    private dialog: MatDialog,
    private initService: AuthInitService,
    private valueSvc: ValueService,
  ) {}

  getLocale(locale: string): string {
    const language = this.initService.ordinals.subTitles.find(
      (v: { srclang: string }) => v.srclang === locale,
    )
    return language ? language.label : 'English'
  }

  ngOnInit() {
    this.valueSvc.isXSmall$.subscribe(isMobile => (this.isMobile = isMobile))
    if (this.content.hasTranslations && this.content.hasTranslations.length) {
      this.translationArray = this.translationArray.concat(this.content.hasTranslations)
    }
    if (this.content.isTranslationOf && this.content.isTranslationOf.length) {
      this.translationArray = this.translationArray.concat(this.content.isTranslationOf)
    }
    this.languages = this.initService.ordinals.subTitles.filter(
      (elem: any) => !this.translationArray.find((item: any) => elem.srclang === item.locale),
    )
    this.translationArray = this.translationArray.map(v => {
      return {
        locale: this.getLocale(v.locale),
        identifier: v.identifier,
      }
    })
    this.icon = this.accessService.getIcon(this.content)
    this.categoryType = this.accessService.getCategoryType(this.content)
    this.category = this.accessService.getCategory(this.content)
    this.locale = this.getLocale(this.content.locale)

    if (this.perspective === 'author' || this.perspective === 'reviewer') {
      if (this.content.status === 'Draft') {
        this.mainAction = 'edit'
        this.allowedActions = this.allowedActions.concat(['newLanguage', 'delete', 'history'])
        this.timeLinePerspective = 'lastUpdated'
      } else if (this.content.status === 'Live') {
        this.timeLinePerspective = 'lastPublished'
        this.mainAction = 'edit'
        this.allowedActions = this.allowedActions.concat([
          'newLanguage',
          'delete',
          'unpublish',
          'history',
        ])
      } else if (this.content.status === 'Unpublished') {
        this.timeLinePerspective = 'lastUnpublished'
        this.mainAction = 'moveToDraft'
        this.allowedActions = this.allowedActions.concat(['newLanguage', 'delete', 'history'])
      } else if (['InReview', 'Reviewed', 'QualityReview'].includes(this.content.status)) {
        this.timeLinePerspective = 'lastAction'
        if (this.accessService.hasRole(['editor', 'admin'])) {
          this.mainAction = 'takeAction'
          this.allowedActions = this.allowedActions.concat(['newLanguage', 'pullBack', 'history'])
        } else if (
          this.content.publisherDetails.find(v => v.id === this.accessService.userId) ||
          this.content.trackContacts.find(v => v.id === this.accessService.userId)
        ) {
          this.mainAction = 'takeAction'
        } else if (this.content.creatorContacts.find(v => v.id === this.accessService.userId)) {
          this.mainAction = 'pullBack'
          this.allowedActions = this.allowedActions.concat(['newLanguage', 'history'])
        }
      } else if (this.content.status === 'Deleted') {
        this.mainAction = 'restore'
        this.timeLinePerspective = 'deleted'
        this.allowedActions = this.allowedActions.concat(['newLanguage', 'history'])
      }
    } else if (this.perspective === 'expiry') {
      this.mainAction = 'extend'
      this.timeLinePerspective = 'expires'
      this.allowedActions = this.allowedActions.concat(['newLanguage', 'delete', 'history'])
    }
    if (this.content.status === 'Processing') {
      this.allowedActions.push('history')
    }
    if (this.content.isMetaEditingDisabled || this.content.isAuthoringDisabled) {
      this.disabledActions = this.disabledActions.concat(['edit', 'delete'])
    }
    if (this.content.isContentEditingDisabled) {
      this.disabledActions = this.disabledActions.concat(['delete'])
    }
    if (!this.initService.authAdditionalConfig.allowActionHistory) {
      const index = this.allowedActions.indexOf('history')
      this.allowedActions.slice(index, 1)
    }
  }

  changeToDefaultImg($event: any) {
    $event.target.src = this.accessService.defaultLogo
  }

  onClick(action: string) {
    this.action.emit({ action, content: this.content })
  }

  create(lang: string) {
    this.action.emit({
      action: 'create',
      content: { ...this.content, locale: lang },
    })
  }

  delete() {
    const dialog = this.dialog.open(DeleteDialogComponent, {
      width: this.isMobile ? '90vw' : '600px',
      height: 'auto',
      data: this.content,
    })
    dialog.afterClosed().subscribe(v => {
      if (v) {
        this.onClick('remove')
      }
    })
  }

  actionHistory() {
    this.dialog.open(StatusTrackComponent, {
      width: this.isMobile ? '90vw' : '600px',
      height: 'auto',
      data: this.content,
    })
  }

  restore() {
    const dialog = this.dialog.open(RestoreDialogComponent, {
      width: this.isMobile ? '90vw' : '600px',
      height: 'auto',
      data: this.content,
    })
    dialog.afterClosed().subscribe(v => {
      if (v) {
        this.onClick('edit')
      }
    })
  }

  unpublish() {
    const dialog = this.dialog.open(UnpublishDialogComponent, {
      width: this.isMobile ? '90vw' : '600px',
      height: 'auto',
      data: this.content,
    })
    dialog.afterClosed().subscribe(v => {
      if (v) {
        this.onClick('edit')
      }
    })
  }

  moveToDraft() {
    const dialog = this.dialog.open(DraftDialogComponent, {
      width: this.isMobile ? '90vw' : '600px',
      height: 'auto',
      data: this.content,
    })
    dialog.afterClosed().subscribe(v => {
      if (v) {
        this.onClick('edit')
      }
    })
  }

  extendOrExpiry() {
    const dialog = this.dialog.open(AuthExpiryDateConfirmComponent, {
      width: this.isMobile ? '90vw' : '600px',
      height: 'auto',
      data: this.content,
    })
    dialog.afterClosed().subscribe(v => {
      if (v) {
        this.onClick('remove')
      }
    })
  }

  changeToGlobalSymbol($event: any) {
    $event.target.src = '/assets/common/flags/pref.png'
  }
}
