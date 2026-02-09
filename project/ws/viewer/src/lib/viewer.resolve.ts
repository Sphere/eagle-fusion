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
   * @param batchId - Batch ID for fetching progress
   * @returns Promise<{isAccessible, redirectUrl}> - Validation result
   */
  private async validateGatedResourceAccess(
    resourceId: string,
    collectionId: string | null,
    batchId: string | null
  ): Promise<{ isAccessible: boolean; redirectUrl?: string }> {
    try {
      // collectionId is now required for validation
      if (!collectionId) {
        // Return false if no collection ID - user must access through proper course navigation
        return {
          isAccessible: false,
          redirectUrl: '/app/home' // Redirect to home if trying to access directly without context
        }
      }

      // Fetch the course/collection content with full hierarchy
      const courseContent = await this.contentSvc.fetchHierarchyContent(collectionId).toPromise()
      const courseData = courseContent?.result?.content

      console.log('Gating Validation Debug:', {
        collectionId,
        resourceId,
        gatingEnabled: courseData?.gatingEnabled,
        courseHasChildren: !!courseData?.children?.length,
        childrenCount: courseData?.children?.length || 0
      })

      // If course doesn't have gating, allow access
      if (!courseData?.gatingEnabled) {
        console.warn('Gating not enabled on course')
        return { isAccessible: true }
      }

      // Fetch user progress and merge with hierarchy
      if (batchId) {
        await this.mergeProgressIntoHierarchy(courseData, collectionId, batchId)
      }

      // Find the current resource in the course hierarchy
      const resourcePosition = this.findResourceInHierarchy(
        courseData,
        resourceId
      )

      if (!resourcePosition) {
        // Resource not found in course hierarchy
        console.warn('Resource not found in course hierarchy. Users cannot access unregistered resources.')
        return { isAccessible: false, redirectUrl: `/app/toc/${collectionId}/overview` }
      }

      console.log('Resource found in hierarchy:', { resourceId, hierarchyDepth: resourcePosition.hierarchy?.length })

      // Check if all previous resources are completed
      const canAccess = this.checkPreviousResourcesCompleted(
        resourcePosition
      )

      console.log('Previous resource check:', { canAccess, resourceId })

      if (!canAccess) {
        // User cannot access this resource, redirect to course TOC
        console.error('User blocked: Previous resources not completed', { resourceId, collectionId })
        const redirectUrl = `/app/toc/${collectionId}/overview`
        return {
          isAccessible: false,
          redirectUrl
        }
      }

      console.log('User can access resource:', { resourceId })
      return { isAccessible: true }
    } catch (error) {
      // If validation fails, allow access (fail open for user experience)
      console.error('Error validating gated resource access:', error)
      return { isAccessible: true }
    }
  }

  /**
   * Fetch user progress and merge completion percentages into the course hierarchy
   */
  private async mergeProgressIntoHierarchy(
    courseData: any,
    collectionId: string,
    batchId: string
  ): Promise<void> {
    try {
      const progressReq: any = {
        request: {
          batchId,
          userId: this.configSvc.userProfile?.userId,
          courseId: collectionId,
          contentIds: [],
          fields: ['progressdetails']
        }
      }

      const progressResponse = await this.contentSvc.fetchContentHistoryV2(progressReq).toPromise()
      const contentList = progressResponse?.result?.contentList || []

      // Create a map of content ID to completion percentage
      const progressMap: { [key: string]: number } = {}
      contentList.forEach((item: any) => {
        progressMap[item.contentId] = item.completionPercentage || 0
      })

      console.log('Progress Data Merged:', {
        totalContents: contentList.length,
        progressMapSize: Object.keys(progressMap).length
      })

      // Update completion percentages in the hierarchy
      this.updateHierarchyWithProgress(courseData, progressMap)
    } catch (error) {
      console.warn('Could not fetch user progress, using hierarchy data:', error)
      // Continue with hierarchy data if progress fetch fails
    }
  }

  /**
   * Recursively update hierarchy nodes with actual user progress
   */
  private updateHierarchyWithProgress(node: any, progressMap: { [key: string]: number }): void {
    if (!node) return

    // Update current node if it exists in progress map
    if (progressMap.hasOwnProperty(node.identifier)) {
      node.completionPercentage = progressMap[node.identifier]
    }

    // Recursively update children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child: any) => {
        this.updateHierarchyWithProgress(child, progressMap)
      })

      // Calculate parent completion from children if not in progress map
      if (!progressMap.hasOwnProperty(node.identifier) && node.children.length > 0) {
        const completedChildren = node.children.filter(
          (child: any) => {
            const completion = Number(child.completionPercentage) || 0
            return completion >= 100
          }
        ).length
        const calculatedCompletion = (completedChildren / node.children.length) * 100
        if (calculatedCompletion > 0) {
          node.completionPercentage = Math.round(calculatedCompletion)
          console.log('Calculated parent completion:', {
            id: node.identifier,
            completed: completedChildren,
            total: node.children.length,
            percentage: node.completionPercentage
          })
        }
      }
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
          const completionPercentage = Number(sibling.completionPercentage) || 0

          console.log('Checking sibling:', {
            id: sibling.identifier,
            name: sibling.name,
            completionPercentage: sibling.completionPercentage,
            normalizedCompletion: completionPercentage,
            isComplete: completionPercentage >= 100
          })

          // Allow access if sibling is 100% complete or has all children completed
          if (completionPercentage < 100) {
            // Check if sibling has children and all are completed (fallback validation)
            if (sibling.children && sibling.children.length > 0) {
              const allChildrenComplete = sibling.children.every(
                (child: any) => {
                  const childCompletion = Number(child.completionPercentage) || 0
                  return childCompletion >= 100
                }
              )
              if (allChildrenComplete) {
                console.log('Sibling children all complete, allowing access:', sibling.identifier)
                continue
              }
            }
            console.error('Blocking access: Sibling not complete:', sibling.identifier)
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

        // Get collectionId and batchId from query params
        const collectionId = route.queryParamMap.get('collectionId')
        const batchId = route.queryParamMap.get('batchId')

        // Validate gating for all non-preview requests
        // Users must access resources through the proper course structure with collectionId
        if (!forPreview) {
          return from(this.validateGatedResourceAccess(content.identifier, collectionId, batchId))
            .pipe(
              switchMap(validation => {
                if (!validation.isAccessible && validation.redirectUrl) {
                  // Redirect to course TOC or home if not accessible
                  this.router.navigate([validation.redirectUrl])
                  return throwError(() => new Error('Resource not accessible due to gating or missing course context'))
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
