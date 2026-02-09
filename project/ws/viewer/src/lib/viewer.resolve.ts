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
        console.log('✅ Progress data merged into hierarchy before gating check')
      } else {
        console.warn('⚠️ No batchId provided, skipping progress merge')
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
      // First, collect all content IDs from the hierarchy
      const contentIds = this.collectContentIdsFromHierarchy(courseData)

      console.log('Collecting content IDs for progress fetch:', {
        totalContentIds: contentIds.length,
        contentIds: contentIds.slice(0, 5) // Log first 5 for debugging
      })

      // Only fetch if we have content IDs
      if (contentIds.length === 0) {
        console.warn('No content IDs found in hierarchy, skipping progress fetch')
        return
      }

      const progressReq: any = {
        request: {
          batchId,
          userId: this.configSvc.userProfile?.userId,
          courseId: collectionId,
          contentIds: contentIds,
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
        progressMapSize: Object.keys(progressMap).length,
        sampleData: contentList.slice(0, 3).map((c: any) => ({
          id: c.contentId,
          percentage: c.completionPercentage
        }))
      })

      // Update completion percentages in the hierarchy
      this.updateHierarchyWithProgress(courseData, progressMap)
    } catch (error) {
      console.warn('Could not fetch user progress, using hierarchy data:', error)
      // Continue with hierarchy data if progress fetch fails
    }
  }

  /**
   * Recursively collect all content IDs from the course hierarchy
   */
  private collectContentIdsFromHierarchy(node: any, ids: string[] = []): string[] {
    if (!node) return ids

    // Add current node's identifier
    if (node.identifier) {
      ids.push(node.identifier)
    }

    // Recursively add children's identifiers
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child: any) => {
        this.collectContentIdsFromHierarchy(child, ids)
      })
    }

    return ids
  }

  /**
   * Recursively update hierarchy nodes with actual user progress
   */
  private updateHierarchyWithProgress(node: any, progressMap: { [key: string]: number }): void {
    if (!node) return

    // Update current node if it exists in progress map
    if (progressMap.hasOwnProperty(node.identifier)) {
      const newPercentage = progressMap[node.identifier]
      console.log('Updating node completion percentage:', {
        identifier: node.identifier,
        name: node.name,
        oldPercentage: node.completionPercentage,
        newPercentage: newPercentage
      })
      node.completionPercentage = newPercentage
    } else {
      console.log('No progress data found for node:', {
        identifier: node.identifier,
        name: node.name,
        currentPercentage: node.completionPercentage
      })
    }

    // Recursively update children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child: any) => {
        this.updateHierarchyWithProgress(child, progressMap)
      })
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
   * Check if a node is a Collection (folder/module container)
   */
  private isCollection(node: any): boolean {
    return node.contentType === 'Collection'
  }

  /**
   * Check if a node is a leaf (terminal) node with no children
   */
  private isLeafNode(node: any): boolean {
    return !node.children || node.children.length === 0
  }

  /**
   * Check if a resource/section is completely done
   * Collections (folders) are auto-complete if all their descendants are complete
   * Leaf resources must have completionPercentage === 100
   */
  private isSectionComplete(node: any): boolean {
    if (!node) return false

    // Collections (folders/modules) don't track progress themselves
    // Check if ALL actual resource descendants are complete
    if (this.isCollection(node)) {
      console.log('Checking collection descendants:', {
        id: node.identifier,
        name: node.name,
        childrenCount: node.children?.length || 0
      })

      if (!node.children || node.children.length === 0) {
        // Empty collection is considered complete
        return true
      }

      // Collection is complete if ALL descendants are complete
      return node.children.every((child: any) => this.isSectionComplete(child))
    }

    // For non-collection nodes:
    // If it's a leaf node, check its completion percentage
    if (this.isLeafNode(node)) {
      const completion = node.completionPercentage
      const isComplete = completion === 100
      if (!isComplete) {
        console.error('Resource not complete:', {
          id: node.identifier,
          name: node.name,
          contentType: node.contentType,
          completionPercentage: completion
        })
      }
      return isComplete
    }

    // If it's a non-collection section (has children), all children must be complete
    return node.children.every((child: any) => this.isSectionComplete(child))
  }

  /**
   * Check if all previous resources in sequence are completed
   * Skips Collections (folders) and only validates actual resources
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

          console.log('Checking sibling for completion:', {
            id: sibling.identifier,
            name: sibling.name,
            contentType: sibling.contentType,
            isCollection: this.isCollection(sibling),
            isLeaf: this.isLeafNode(sibling),
            completionPercentage: sibling.completionPercentage
          })

          // Skip Collections (folders/modules) - they don't need gating validation
          if (this.isCollection(sibling)) {
            console.log('⏭️ Skipping Collection node:', {
              id: sibling.identifier,
              name: sibling.name
            })
            continue
          }

          // Check if sibling and all its actual resource descendants are complete
          const isComplete = this.isSectionComplete(sibling)

          if (!isComplete) {
            console.error('Blocking access: Resource not complete:', {
              siblingId: sibling.identifier,
              siblingName: sibling.name,
              contentType: sibling.contentType,
              isLeaf: this.isLeafNode(sibling)
            })
            return false
          }

          console.log('✅ Resource complete:', {
            id: sibling.identifier,
            name: sibling.name,
            contentType: sibling.contentType
          })
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
