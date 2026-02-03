import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router'
import { catchError, map, tap, switchMap } from 'rxjs/operators'
import { Observable, of, from, throwError } from 'rxjs'
import { AccessControlService } from '@ws/author'
import { WidgetContentService, NsContent, VIEWER_ROUTE_FROM_MIME } from '@ws-widget/collection'
import { IResolveResponse, AuthMicrosoftService, ConfigurationsService } from '@ws-widget/utils'
import { ViewerDataService } from './viewer-data.service'
import { MobileAppsService } from '../../../../../src/app/services/mobile-apps.service'
import { Platform } from '@angular/cdk/platform'

// const ADDITIONAL_FIELDS_IN_CONTENT = ['creatorContacts', 'source', 'exclusiveContent', 'body']
@Injectable()
export class ViewerResolve
  implements
  Resolve<
    Observable<IResolveResponse<NsContent.IContent>> | IResolveResponse<NsContent.IContent> | null
  > {
  constructor(
    private contentSvc: WidgetContentService,
    private viewerDataSvc: ViewerDataService,
    private mobileAppsSvc: MobileAppsService,
    private router: Router,
    private accessControlSvc: AccessControlService,
    private msAuthSvc: AuthMicrosoftService,
    private configSvc: ConfigurationsService,
    private platform: Platform,
  ) { }

  /**
   * Validates if user can access a resource based on course gating rules
   * When gating is enabled, user can only access resources in sequential order
   * @param resourceId - Current resource identifier
   * @param collectionId - Parent course/collection identifier
   * @param route - ActivatedRouteSnapshot containing route params
   * @returns Promise<{isAccessible, redirectUrl}> - Validation result
   */
  private async validateGatedResourceAccess(
    resourceId: string,
    collectionId: string | null,
    // route: ActivatedRouteSnapshot
  ): Promise<{ isAccessible: boolean; redirectUrl?: string }> {
    try {
      // If no collection ID, allow access (not a gated course)
      if (!collectionId) {
        return { isAccessible: true }
      }

      // Fetch the course/collection content
      const courseContent = await this.contentSvc.readContentV2(collectionId).toPromise()
      const courseData = courseContent?.result?.content

      // If course doesn't have gating, allow access
      if (!courseData?.gatingEnabled) {
        return { isAccessible: true }
      }

      // Find the current resource in the course hierarchy
      const resourcePosition = this.findResourceInHierarchy(
        courseData,
        resourceId
      )

      if (!resourcePosition) {
        // Resource not found in course, allow access
        return { isAccessible: true }
      }

      // Check if all previous resources are completed
      const canAccess = this.checkPreviousResourcesCompleted(
        resourcePosition
      )

      if (!canAccess) {
        // User cannot access this resource, redirect to course TOC
        const redirectUrl = `/app/toc/${collectionId}/overview?primaryCategory=${courseData.primaryCategory}`
        return {
          isAccessible: false,
          redirectUrl
        }
      }

      return { isAccessible: true }
    } catch (error) {
      // If validation fails, allow access (fail open for user experience)
      console.error('Error validating gated resource access:', error)
      return { isAccessible: true }
    }
  }

  /**
   * Find resource position in course hierarchy
   * Returns hierarchical position information for validation
   */
  private findResourceInHierarchy(
    content: any,
    resourceId: string,
    hierarchy: any[] = []
  ): any {
    if (content.identifier === resourceId) {
      return { content, hierarchy: [...hierarchy, content] }
    }

    if (!content.children || content.children.length === 0) {
      return null
    }

    for (const child of content.children) {
      const result = this.findResourceInHierarchy(
        child,
        resourceId,
        [...hierarchy, content]
      )
      if (result) {
        return result
      }
    }

    return null
  }

  /**
   * Check if all previous resources in sequence are completed
   */
  private checkPreviousResourcesCompleted(resourcePosition: any): boolean {
    const { hierarchy } = resourcePosition

    if (!hierarchy || hierarchy.length === 0) {
      return true
    }

    // Check resources in reverse order (from current up to root)
    for (let i = hierarchy.length - 1; i > 0; i--) {
      const parent = hierarchy[i - 1]
      const currentNode = hierarchy[i]

      if (!parent.children) {
        continue
      }

      const currentIndex = parent.children.findIndex(
        (c: any) => c.identifier === currentNode.identifier
      )

      // Check all siblings before current resource
      if (currentIndex > 0) {
        for (let j = 0; j < currentIndex; j++) {
          const sibling = parent.children[j]
          if (sibling.completionPercentage !== 100) {
            return false
          }
        }
      }
    }

    return true
  }

  // resolve(route: ActivatedRouteSnapshot): Observable<IResolveResponse<NsContent.IContent>> | null {
  //   const resourceType = route.data.resourceType
  //   // this.viewerDataSvc.reset(route.paramMap.get('resourceId'))
  //   this.viewerDataSvc.reset(route.paramMap.get('resourceId'), 'none', route.queryParams['primaryCategory'])
  //   if (!this.viewerDataSvc.resourceId) {
  //     return null
  //   }
  //   if (
  //     route.queryParamMap.get('preview') === 'true' &&
  //     !this.accessControlSvc.authoringConfig.newDesign
  //   ) {
  //     return null
  //   }
  //   console.log('99999999', this.viewerDataSvc.primaryCategory, 'llllll')
  //   const forPreview = window.location.href.includes('/author/')
  //   return (forPreview
  //     ? this.contentSvc.fetchAuthoringContent(this.viewerDataSvc.resourceId)
  //     : this.contentSvc.fetchContent(
  //       this.viewerDataSvc.resourceId,
  //       'detail',
  //       ADDITIONAL_FIELDS_IN_CONTENT,
  //       this.viewerDataSvc.primaryCategory,
  //     )
  //   ).pipe(
  //     tap(content => {
  //       console.log('viewr resolver===')
  //       if (content.status === 'Deleted' || content.status === 'Expired') {
  //         this.router.navigate([
  //           // `${forPreview ? '/author' : '/app'}/toc/${content.identifier}/overview`,
  //           `${forPreview ? '/author' : '/app'}/toc/${content.identifier}/overview?primaryCategory = ${content.primaryCategory}`,

  //         ])
  //       }
  //       if (content.ssoEnabled) {
  //         this.msAuthSvc.loginForSSOEnabledEmbed(
  //           (this.configSvc.userProfile && this.configSvc.userProfile.email) || '',
  //         )
  //       }

  //       if (resourceType === 'unknown') {
  //         this.router.navigate([
  //           `${forPreview ? '/author' : ''}/viewer/${VIEWER_ROUTE_FROM_MIME(content.mimeType)}/${content.identifier
  //           }`,
  //         ])
  //       } else if (resourceType === VIEWER_ROUTE_FROM_MIME(content.mimeType)) {
  //         this.viewerDataSvc.updateResource(content, null)
  //       } else {
  //         this.viewerDataSvc.updateResource(null, {
  //           errorType: 'mimeTypeMismatch',
  //           mimeType: content.mimeType,
  //           probableUrl: `${forPreview ? '/author' : ''}/viewer/${VIEWER_ROUTE_FROM_MIME(
  //             content.mimeType,
  //           )}/${content.identifier}`,
  //         })
  //       }
  //     }),
  //     map(data => {
  //       data = data.result.content
  //       if (resourceType === 'unknown') {
  //         this.router.navigate([
  //           `${forPreview ? '/author' : ''}/viewer/${VIEWER_ROUTE_FROM_MIME(data.mimeType)}/${data.identifier
  //           }`,
  //         ])
  //       } else if (resourceType === VIEWER_ROUTE_FROM_MIME(data.mimeType)) {
  //         data.platform = this.platform
  //         this.mobileAppsSvc.sendViewerData(data)
  //         return { data, error: null }
  //       }
  //       return { data: null, error: 'mimeTypeMismatch' }
  //     }),
  //     catchError(error => {
  //       this.viewerDataSvc.updateResource(null, error)
  //       return of({ error, data: null })
  //     }),
  //   )
  // }

  resolve(route: ActivatedRouteSnapshot): Observable<IResolveResponse<NsContent.IContent>> | null {
    const resourceType = route.data.resourceType
    const collectionId = route.queryParamMap.get('collectionId') // Get collection ID from query params

    this.viewerDataSvc.reset(route.paramMap.get('resourceId'), 'none', route.queryParams['primaryCategory'])
    if (!this.viewerDataSvc.resourceId) {
      return null
    }
    if (
      route.queryParamMap.get('preview') === 'true' &&
      !this.accessControlSvc.authoringConfig.newDesign &&
      resourceType !== 'quiz'
    ) {
      return null
    }

    const forPreview = window.location.href.includes('/author/') || route.queryParamMap.get('preview') === 'true'
    return (forPreview
      ? this.contentSvc.fetchAuthoringContent(this.viewerDataSvc.resourceId)
      : this.contentSvc.readContentV2(this.viewerDataSvc.resourceId)
    ).pipe(
      // Validate gated access before proceeding
      switchMap(response => {
        const content = response?.result?.content

        // Only validate if not in preview mode and gating might be enabled
        if (!forPreview && collectionId) {
          return from(this.validateGatedResourceAccess(content.identifier, collectionId))
            .pipe(
              switchMap(validation => {
                if (!validation.isAccessible && validation.redirectUrl) {
                  // Redirect to course TOC if not accessible
                  this.router.navigate([validation.redirectUrl])
                  return throwError(() => new Error('Resource not accessible due to gating'))
                }
                return of(response)
              })
            )
        }

        return of(response)
      }),
      tap(content => {
        // tslint:disable-next-line: no-parameter-reassignment
        content = content.result.content
        if (content && content.gatingEnabled) {
          this.viewerDataSvc.setNode(content.gatingEnabled)
        }
        if (content.status === 'Deleted' || content.status === 'Expired') {
          this.router.navigate([
            `${forPreview ? '/author' : '/app'}/toc/${content.identifier}/overview?primaryCategory=${content.primaryCategory}`,
          ])
        }
        if (content.ssoEnabled) {
          this.msAuthSvc.loginForSSOEnabledEmbed(
            (this.configSvc.userProfile && this.configSvc.userProfile.email) || '',
          )
        }

        if (resourceType === 'unknown') {
          this.router.navigate([
            `${forPreview ? '/author' : ''}/viewer/${VIEWER_ROUTE_FROM_MIME(content.mimeType)}/${content.identifier
            }`,
          ])
        } else if (resourceType === VIEWER_ROUTE_FROM_MIME(content.mimeType)) {
          this.viewerDataSvc.updateResource(content, null)
        } else {
          this.viewerDataSvc.updateResource(null, {
            errorType: 'mimeTypeMismatch',
            mimeType: content.mimeType,
            probableUrl: `${forPreview ? '/author' : ''}/viewer/${VIEWER_ROUTE_FROM_MIME(
              content.mimeType,
            )}/${content.identifier}`,
          })
        }
      }),
      map(data => {
        // tslint:disable-next-line: no-parameter-reassignment
        data = data.result.content
        if (resourceType === 'unknown') {
          this.router.navigate([
            `${forPreview ? '/author' : ''}/viewer/${VIEWER_ROUTE_FROM_MIME(data.mimeType)}/${data.identifier
            }`,
          ])
        } else if (resourceType === VIEWER_ROUTE_FROM_MIME(data.mimeType)) {
          data.platform = this.platform
          this.mobileAppsSvc.sendViewerData(data)
          return { data, error: null }
        }
        return { data: null, error: 'mimeTypeMismatch' }
      }),
      catchError(error => {
        // Only log gating errors, don't fail the entire resolution
        if (error.message !== 'Resource not accessible due to gating') {
          this.viewerDataSvc.updateResource(null, error)
        }
        return of({ error, data: null })
      }),
    )
  }

}
