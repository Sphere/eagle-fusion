import { AUTHORING_CONTENT_BASE } from '@ws/author/src/lib/constants/apiEndpoints'
import { ICON_TYPE } from '@ws/author/src/lib/constants/icons'
import { MIME_TYPE } from '@ws/author/src/lib/constants/mimeType'
import { ISearchContent } from '@ws/author/src/lib/interface/search'
import { APP_BASE_HREF } from '@angular/common'
import { Inject, Injectable } from '@angular/core'
import { ConfigurationsService, NsInstanceConfig } from '@ws-widget/utils'
import { NSContent } from '@ws/author/src/lib/interface/content'

@Injectable()
export class AccessControlService {
  downloadRegex = new RegExp(`(https://.*?/content-store/.*?)(\\\)?\\\\?['"])`, 'gm')
  constructor(
    private configService: ConfigurationsService,
    @Inject(APP_BASE_HREF) private baseHref: string,
  ) { }

  hasRole(role: string[]): boolean {
    let returnValue = false
    role.forEach(v => {
      if ((this.configService.userRoles || new Set()).has(v)) {
        returnValue = true
      }
    })
    return returnValue
  }

  get authoringConfig() {
    return (this.configService.instanceConfig as NsInstanceConfig.IConfig).authoring
  }

  get userId(): string {
    if (this.configService.userProfile) {
      return this.configService.userProfile.userId
    }
    return ''
  }

  get userName(): string {
    if (this.configService.userProfile) {
      return this.configService.userProfile.userName || ''
    }
    return ''
  }

  get locale(): string {
    // return this.configService.userPreference && this.configService.userPreference.selectedLocale ?
    //   this.configService.userPreference.selectedLocale : 'en'
    return this.baseHref && this.baseHref.replace(/\//g, '')
      ? this.baseHref.replace(/\//g, '').split('-')[0]
      : 'en'
  }

  get org(): string {
    return this.configService.activeOrg || 'DOPT Ltd'
  }

  get rootOrg(): string {
    return this.configService.rootOrg || 'dopt'
  }

  get orgRootOrgAsQuery(): string {
    return `?rootOrg=${this.rootOrg}&org=${this.org}`
  }

  get defaultLogo(): string {
    return this.configService.instanceConfig
      ? this.configService.instanceConfig.logos.defaultContent
      : ''
  }

  get appName(): string {
    return this.configService.instanceConfig
      ? this.configService.instanceConfig.details.appName
      : 'Wingspan'
  }

  get activePrimary(): string {
    return this.configService.activeThemeObject
      ? this.configService.activeThemeObject.color.primary
      : ''
  }

  getAction(status: string, operation?: number): string {
    switch (status) {
      case 'Draft':
      case 'Live':
        return 'submitted'
      case 'InReview':
        return operation ? 'reviewerApproved' : 'reviewerRejected'
      case 'QualityReview':
        return operation ? 'qualityApproved' : 'qualityRejected'
      case 'Reviewed':
        return operation ? 'publisherApproved' : 'publisherRejected'
      default:
        return 'submitted'
    }
  }
  hasAccess(
    meta: NSContent.IContentMeta,
    forPreview = false,
    parentMeta?: NSContent.IContentMeta,
  ): boolean {
    if (this.hasRole(['editor', 'admin'])) {
      return true
    }
    let returnValue = false
    if (['Draft', 'Live'].indexOf(meta.status) > -1) {
      if (meta.creatorContacts && meta.creatorContacts.length) {
        meta.creatorContacts.forEach(v => {
          if (v.id === this.userId) {
            returnValue = true
          }
        })
      }
    }
    if (meta.status === 'InReview' && this.hasRole(['reviewer'])) {
      if (meta.trackContacts && meta.trackContacts.length) {
        meta.trackContacts.forEach(v => {
          if (v.id === this.userId) {
            returnValue = true
          }
        })
      }
      if (!returnValue && parentMeta && parentMeta.creatorContacts && meta.creatorContacts) {
        returnValue = parentMeta.creatorContacts.some(v =>
          meta.creatorContacts.find(cv => cv.id === v.id),
        )
      }
    }
    if (['Reviewed'].indexOf(meta.status) > -1 && this.hasRole(['publisher'])) {
      if (meta.publisherDetails && meta.publisherDetails.length) {
        meta.publisherDetails.forEach(v => {
          if (v.id === this.userId) {
            returnValue = true
          }
        })
      }
      if (!returnValue && parentMeta && parentMeta.creatorContacts && meta.creatorContacts) {
        returnValue = parentMeta.creatorContacts.some(v =>
          meta.creatorContacts.find(cv => cv.id === v.id),
        )
      }
    }
    if (forPreview && meta.visibility === 'Public') {
      returnValue = true
    }
    return returnValue
  }

  convertToISODate(date = ''): Date {
    try {
      return new Date(
        `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}${date.substring(
          8,
          11,
        )}:${date.substring(11, 13)}:${date.substring(13, 15)}.000Z`,
      )
    } catch (ex) {
      return new Date(new Date().setMonth(new Date().getMonth() + 6))
    }
  }

  convertToESDate(expiryDate: Date): string {
    return `${expiryDate.toISOString().replace(/-/g, '').replace(/:/g, '').split('.')[0]}+0000`
  }

  /**
   * Since the category is not populated for old content to make it backward compatible
   * we are checking the category first if it is not present we are sending the contentType
   *
   * @param { IContentMeta } content - The content for which we need to get category
   * @returns { string } The category
   */
  getCategory(content: NSContent.IContentMeta | ISearchContent): string {
    return content.category || content.contentType
  }

  /**
   * Since the categoryType is not populated for old content to make it backward compatible
   * we are checking the categoryType first if it is not present we are checking the contentType
   * and based on contentType we select resourceType or courseType
   *
   * @param { IContentMeta } content - The content for which we need to get category
   * @returns { string } The category type
   */
  getCategoryType(content: NSContent.IContentMeta | ISearchContent): string {
    switch (this.getCategory(content)) {
      case 'Resource':
        return content.categoryType || content.resourceType || 'Resource'
      case 'Collection':
        return content.categoryType || 'Module'
      case 'Course':
        return content.categoryType || 'Course'
      case 'Learning Path':
        return content.categoryType || 'Program'
      default:
        return this.getCategory(content)
    }
  }

  /**
   * To get the respective Mat icon mapping for the each contents
   * For different resources we need different types of icons
   *
   * @param { NSContent.IContentMeta } content - The content for which we need to get category
   * @returns { string } The mat icon to be displayed
   */
  getIcon(content: NSContent.IContentMeta | ISearchContent): string {
    if (content.mimeType === MIME_TYPE.collection) {
      if (this.getCategory(content) === 'Knowledge Board') {
        return ICON_TYPE.kBoard
      }
      if (this.getCategory(content) === 'Learning Path') {
        return ICON_TYPE.program
      }
      if (this.getCategory(content) === 'Course') {
        return ICON_TYPE.course
      }
      return ICON_TYPE.learningModule
    }
    if (content.mimeType === MIME_TYPE.html) {
      if (content.resourceType === 'Certification') {
        return ICON_TYPE.certificate
      }
      if (content.isExternal) {
        return ICON_TYPE.externalContent
      }
      return ICON_TYPE.internalContent
    }
    if (content.mimeType === MIME_TYPE.pdf) {
      if (!content.artifactUrl) {
        return ICON_TYPE.emptyFile
      }
      return ICON_TYPE.pdf
    }
    if (content.mimeType === MIME_TYPE.youtube) {
      return ICON_TYPE.youtube
    }
    if (content.mimeType === MIME_TYPE.quiz) {
      if (this.getCategoryType(content) === 'Assessment') {
        return ICON_TYPE.assessment
      }
      return ICON_TYPE.quiz
    }
    if (content.mimeType === MIME_TYPE.dragDrop) {
      return ICON_TYPE.dragNDrop
    }
    if (content.mimeType === MIME_TYPE.htmlPicker) {
      return ICON_TYPE.htmlPicker
    }
    if (content.mimeType === MIME_TYPE.webModule) {
      return ICON_TYPE.internalContent
    }
    if (content.mimeType === MIME_TYPE.handson) {
      return ICON_TYPE.handsOn
    }
    if (content.mimeType === MIME_TYPE.iap) {
      return ICON_TYPE.iap
    }
    if (content.mimeType === MIME_TYPE.mp3) {
      return ICON_TYPE.audio
    }
    if (content.mimeType === MIME_TYPE.mp4) {
      return ICON_TYPE.video
    }
    return ICON_TYPE.default
  }

  proxyToAuthoringUrl(value: string): string {
    return value.replace(this.downloadRegex, this.regexDownloadReplace)
  }

  regexDownloadReplace(_str = '', group1: string, group2: string): string {
    return `${AUTHORING_CONTENT_BASE}${encodeURIComponent(group1)}${group2}`
  }
}
