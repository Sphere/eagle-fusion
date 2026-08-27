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
    private readonly configService: ConfigurationsService,
    @Inject(APP_BASE_HREF) private readonly baseHref: string,
  ) { }

  hasRole(role: string[]): boolean {
    let returnValue = false
    role.forEach(v => {
      if ((this.configService.userRoles || new Set()).has(v.toLowerCase())) {
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
    return this.baseHref && this.baseHref.replaceAll(/\//g, '')
      ? this.baseHref.replaceAll(/\//g, '').split('-')[0]
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
      returnValue = this.hasContactAccess(meta.creatorContacts)
    }
    if (meta.status === 'InReview' && this.hasRole(['reviewer'])) {
      returnValue = this.hasContactAccess(meta.trackContacts)
        || this.hasParentCreatorOverlap(meta, parentMeta, returnValue)
    }
    if (['Reviewed'].indexOf(meta.status) > -1 && this.hasRole(['publisher'])) {
      returnValue = this.hasContactAccess(meta.publisherDetails)
        || this.hasParentCreatorOverlap(meta, parentMeta, returnValue)
    }
    if (forPreview && meta.visibility === 'Public') {
      returnValue = true
    }
    return returnValue
  }

  private hasContactAccess(contacts?: { id: string }[]): boolean {
    return Boolean(contacts && contacts.length && contacts.some(v => v.id === this.userId))
  }

  private hasParentCreatorOverlap(
    meta: NSContent.IContentMeta,
    parentMeta: NSContent.IContentMeta | undefined,
    alreadyGranted: boolean,
  ): boolean {
    if (alreadyGranted || !parentMeta || !parentMeta.creatorContacts || !meta.creatorContacts) {
      return alreadyGranted
    }
    return parentMeta.creatorContacts.some(v =>
      meta.creatorContacts.find(cv => cv.id === v.id),
    )
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
    return `${expiryDate.toISOString().replaceAll(/-/g, '').replaceAll(/:/g, '').split('.')[0]}+0000`
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
    switch (content.mimeType) {
      case MIME_TYPE.collection:
        return this.getCollectionIcon(content)
      case MIME_TYPE.html:
        return this.getHtmlIcon(content)
      case MIME_TYPE.pdf:
        return content.artifactUrl ? ICON_TYPE.pdf : ICON_TYPE.emptyFile
      case MIME_TYPE.youtube:
        return ICON_TYPE.youtube
      case MIME_TYPE.quiz:
        return this.getCategoryType(content) === 'Assessment' ? ICON_TYPE.assessment : ICON_TYPE.quiz
      case MIME_TYPE.dragDrop:
        return ICON_TYPE.dragNDrop
      case MIME_TYPE.htmlPicker:
        return ICON_TYPE.htmlPicker
      case MIME_TYPE.webModule:
        return ICON_TYPE.internalContent
      case MIME_TYPE.handson:
        return ICON_TYPE.handsOn
      case MIME_TYPE.iap:
        return ICON_TYPE.iap
      case MIME_TYPE.mp3:
        return ICON_TYPE.audio
      case MIME_TYPE.mp4:
        return ICON_TYPE.video
      default:
        return ICON_TYPE.default
    }
  }

  private getCollectionIcon(content: NSContent.IContentMeta | ISearchContent): string {
    const category = this.getCategory(content)
    if (category === 'Knowledge Board') {
      return ICON_TYPE.kBoard
    }
    if (category === 'Learning Path') {
      return ICON_TYPE.program
    }
    if (category === 'Course') {
      return ICON_TYPE.course
    }
    return ICON_TYPE.learningModule
  }

  private getHtmlIcon(content: NSContent.IContentMeta | ISearchContent): string {
    if (content.resourceType === 'Certification') {
      return ICON_TYPE.certificate
    }
    if (content.isExternal) {
      return ICON_TYPE.externalContent
    }
    return ICON_TYPE.internalContent
  }

  proxyToAuthoringUrl(value: string): string {
    return value.replace(this.downloadRegex, this.regexDownloadReplace)
  }

  regexDownloadReplace(_str = '', group1: string, group2: string): string {
    return `${AUTHORING_CONTENT_BASE}${encodeURIComponent(group1)}${group2}`
  }
}
