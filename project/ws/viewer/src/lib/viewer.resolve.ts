import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Router } from '@angular/router'
import { catchError, map, tap, switchMap } from 'rxjs/operators'
import { Observable, of, from, throwError } from 'rxjs'
import { AccessControlService } from '@ws/author'
import { WidgetContentService, NsContent, VIEWER_ROUTE_FROM_MIME } from '@ws-widget/collection'
import { IResolveResponse, AuthMicrosoftService, ConfigurationsService, LoggerService } from '@ws-widget/utils'
import { ViewerDataService } from './viewer-data.service'
import { MobileAppsService } from '../../../../../src/app/services/mobile-apps.service'
import { Platform } from '@angular/cdk/platform'

// const ADDITIONAL_FIELDS_IN_CONTENT = ['creatorContacts', 'source', 'exclusiveContent', 'body']
@Injectable()
export class ViewerResolve {
  constructor(
    private contentSvc: WidgetContentService,
    private viewerDataSvc: ViewerDataService,
    private mobileAppsSvc: MobileAppsService,
    private router: Router,
    private accessControlSvc: AccessControlService,
    private msAuthSvc: AuthMicrosoftService,
    private configSvc: ConfigurationsService,
    private platform: Platform,
    private logger: LoggerService
  ) { }

  private async validateGatedResourceAccess(
    resourceId: string,
    collectionId: string | null,
    batchId: string | null
  ): Promise<{ isAccessible: boolean; redirectUrl?: string; redirectParams?: { [key: string]: any } }> {
    try {
      // collectionId is now required for validation
      if (!collectionId) {
        // Return false if no collection ID - user must access through proper course navigation
        this.logger.warn('No collectionId provided - cannot validate gating')
        return {
          isAccessible: false,
          redirectUrl: '/app/home'
        }
      }

      // Fetch the course/collection content with full hierarchy
      const courseContent = await this.contentSvc.fetchHierarchyContent(collectionId).toPromise()
      const courseData = courseContent?.result?.content

      this.logger.log('═══════════════════════════════════════════════════════════')
      this.logger.log('GATING VALIDATION START')
      this.logger.log('═══════════════════════════════════════════════════════════')
      this.logger.log('Input Parameters:', {
        resourceId,
        collectionId,
        batchId
      })
      this.logger.log('Course Data:', {
        courseId: courseData?.identifier,
        courseName: courseData?.name,
        gatingEnabled: courseData?.gatingEnabled,
        hasChildren: !!courseData?.children?.length,
        totalChildren: courseData?.children?.length || 0
      })

      // IMPORTANT: Only enforce gating if it's EXPLICITLY enabled on the course
      // If gatingEnabled is undefined, null, or false - allow full access
      if (courseData?.gatingEnabled !== true) {
        this.logger.log('Gating Status: NOT ENABLED (gatingEnabled !== true)')
        this.logger.log('Result: ALLOW FULL ACCESS - No prerequisite checks needed')
        this.logger.log('═══════════════════════════════════════════════════════════')
        return { isAccessible: true }
      }

      this.logger.log('Gating Status: ENABLED - Running prerequisite validation...')

      // Fetch user progress and merge with hierarchy
      if (batchId) {
        await this.mergeProgressIntoHierarchy(courseData, collectionId, batchId)
        this.logger.log('Progress data merged into hierarchy')
      } else {
        this.logger.warn('No batchId provided - using hierarchy data without progress')
      }

      // Find the current resource in the course hierarchy
      const resourcePosition = this.findResourceInHierarchy(
        courseData,
        resourceId
      )

      if (!resourcePosition) {
        // Resource not found in course hierarchy
        this.logger.error('Resource not found in course hierarchy')
        this.logger.log('═══════════════════════════════════════════════════════════')
        return { isAccessible: false, redirectUrl: `/app/toc/${collectionId}/overview` }
      }

      this.logger.log('Resource found in hierarchy')

      // Check if all previous resources are completed
      const canAccess = this.checkPreviousResourcesCompleted(
        resourcePosition
      )

      this.logger.log('═══════════════════════════════════════════════════════════')
      if (canAccess) {
        this.logger.log('RESULT: USER CAN ACCESS THIS RESOURCE')
        this.logger.log('═══════════════════════════════════════════════════════════')
        return { isAccessible: true }
      } else {
        // Prerequisites not met - find the first incomplete prerequisite resource to navigate to
        const incompleteResource = this.findFirstIncompletePrerequisite(resourcePosition)

        if (incompleteResource) {
          this.logger.log('RESULT: USER BLOCKED - Redirecting to incomplete prerequisite')
          this.logger.log('Incomplete resource to resume:', {
            id: incompleteResource.identifier,
            name: incompleteResource.name,
            completion: incompleteResource.completionPercentage
          })
          this.logger.log('═══════════════════════════════════════════════════════════')

          // Generate viewer URL for the incomplete resource
          const viewerRoute = VIEWER_ROUTE_FROM_MIME(incompleteResource.mimeType)
          const redirectUrl = `/viewer/${viewerRoute}/${incompleteResource.identifier}`

          return {
            isAccessible: false,
            redirectUrl,
            redirectParams: {
              primaryCategory: courseData?.primaryCategory || 'Learning Resource',
              collectionId,
              collectionType: 'Course',
              batchId,
              viewMode: 'RESUME'
            }
          }
        } else {
          this.logger.log('RESULT: USER BLOCKED - Prerequisites not met (no specific resource found)')
          this.logger.log('═══════════════════════════════════════════════════════════')
          return {
            isAccessible: false,
            redirectUrl: `/app/toc/${collectionId}/overview`
          }
        }
      }
    } catch (error) {
      // If validation fails, allow access (fail open for user experience)
      this.logger.error('Error in gating validation - allowing access for user experience', error)
      this.logger.log('═══════════════════════════════════════════════════════════')
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

      this.logger.log('Collecting content IDs for progress fetch:', {
        totalContentIds: contentIds.length,
        contentIds: contentIds.slice(0, 5) // Log first 5 for debugging
      })

      // Only fetch if we have content IDs
      if (contentIds.length === 0) {
        this.logger.warn('No content IDs found in hierarchy, skipping progress fetch')
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

      this.logger.log('Progress Data Merged:', {
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
      this.logger.warn('Could not fetch user progress, using hierarchy data:', error)
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
      // this.logger.log('Updating node completion percentage:', {
      //   identifier: node.identifier,
      //   name: node.name,
      //   oldPercentage: node.completionPercentage,
      //   newPercentage: newPercentage
      // })
      node.completionPercentage = newPercentage
    } else {
      // this.logger.log('No progress data found for node:', {
      //   identifier: node.identifier,
      //   name: node.name,
      //   currentPercentage: node.completionPercentage
      // })
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
          this.logger.log('Calculated parent completion:', {
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
   * For gating purposes: a resource is "complete" if:
   * - Leaf resources: completion === 100% (fully completed)
   * - Collections: all children must be complete
   */
  private isSectionComplete(node: any): boolean {
    if (!node) return false

    // Collections (folders/modules) don't track progress themselves
    // Check if ALL actual resource descendants are complete
    if (this.isCollection(node)) {
      this.logger.log('Checking collection completeness:', {
        id: node.identifier,
        name: node.name,
        childrenCount: node.children?.length || 0
      })

      if (!node.children || node.children.length === 0) {
        // Empty collection is considered complete
        this.logger.log('Empty collection = complete')
        return true
      }

      // Collection is complete only if ALL descendants are complete
      const allComplete = node.children.every((child: any) => this.isSectionComplete(child))
      this.logger.log(`  ${allComplete ? '✓' : '✗'} Collection completion: ${allComplete ? 'ALL children complete' : 'SOME children incomplete'}`)
      return allComplete
    }

    // For non-collection (leaf) nodes:
    // A resource must be 100% complete for gating purposes
    if (this.isLeafNode(node)) {
      const completion = Number(node.completionPercentage) || 0
      const isComplete = completion === 100

      if (!isComplete) {
        this.logger.log(`  ✗ ${node.name}: ${completion}% < 100% (incomplete)`)
      } else {
        this.logger.log(`  ✓ ${node.name}: ${completion}% (complete)`)
      }
      return isComplete
    }

    // If it's a non-collection section (has children), all children must be complete
    const allChildrenComplete = node.children.every((child: any) => this.isSectionComplete(child))
    this.logger.log(`  ${allChildrenComplete ? '✓' : '✗'} Section completion: ${allChildrenComplete ? 'ALL children complete' : 'SOME children incomplete'}`)
    return allChildrenComplete
  }

  /**
   * Check if all previous resources in sequence are completed
   * If not, returns the first incomplete prerequisite resource instead of redirecting to TOC
   */
  private findFirstIncompletePrerequisite(resourcePosition: any): any {
    const { hierarchy, content: currentResource } = resourcePosition

    if (!hierarchy || hierarchy.length === 0) {
      this.logger.log('No hierarchy - no prerequisites to check')
      return null
    }

    this.logger.log('Finding first incomplete prerequisite for:', {
      resourceId: currentResource?.identifier,
      resourceName: currentResource?.name,
      hierarchyDepth: hierarchy.length,
      hierarchyPath: hierarchy.map((h: any) => h.name).join(' > ')
    })

    // Check all preceding siblings at each level
    for (let i = hierarchy.length - 1; i > 0; i--) {
      const parent = hierarchy[i - 1]
      const currentNode = hierarchy[i]

      if (!parent.children || !Array.isArray(parent.children)) {
        this.logger.log(`Level ${i}: No children in parent`)
        continue
      }

      const currentIndex = parent.children.findIndex(
        (c: any) => c.identifier === currentNode.identifier
      )

      if (currentIndex < 0) {
        this.logger.warn(`Level ${i}: Could not find current node in parent children`)
        continue
      }

      // Check ALL preceding siblings at this level
      if (currentIndex > 0) {
        for (let j = 0; j < currentIndex; j++) {
          const sibling = parent.children[j]

          // Check if this prerequisite sibling is complete
          const isPrerequisiteComplete = this.isSectionComplete(sibling)

          if (!isPrerequisiteComplete) {
            // Found an incomplete prerequisite - return the first incomplete child resource
            const incompleteResource = this.getFirstIncompleteLeafResource(sibling)
            this.logger.log('Found first incomplete prerequisite:', {
              parentId: sibling.identifier,
              parentName: sibling.name,
              incompleteResourceId: incompleteResource?.identifier,
              incompleteResourceName: incompleteResource?.name,
              contentType: incompleteResource?.contentType
            })
            return incompleteResource
          }
        }
      }
    }

    this.logger.log('ALL prerequisites met - no incomplete prerequisites found')
    return null
  }

  /**
   * Find the first incomplete leaf resource in a node tree
   * Returns the actual resource (leaf) that needs to be completed
   */
  private getFirstIncompleteLeafResource(node: any): any {
    // If it's a leaf resource and incomplete, return it
    if (this.isLeafNode(node)) {
      const completion = Number(node.completionPercentage) || 0
      if (completion < 100) {
        return node
      }
      return null
    }

    // If it's a collection, search for the first incomplete child
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        const incompleteResource = this.getFirstIncompleteLeafResource(child)
        if (incompleteResource) {
          return incompleteResource
        }
      }
    }

    return null
  }

  /**
   * Check if all previous resources in sequence are completed
   * Validates both siblings within same parent AND preceding sections
   */
  private checkPreviousResourcesCompleted(resourcePosition: any): boolean {
    const { hierarchy, content: currentResource } = resourcePosition

    if (!hierarchy || hierarchy.length === 0) {
      this.logger.log('No hierarchy - allowing access')
      return true
    }

    this.logger.log('Checking prerequisites for:', {
      resourceId: currentResource?.identifier,
      resourceName: currentResource?.name,
      hierarchyDepth: hierarchy.length,
      hierarchyPath: hierarchy.map((h: any) => h.name).join(' > ')
    })

    // Validate all preceding siblings at each level
    for (let i = hierarchy.length - 1; i > 0; i--) {
      const parent = hierarchy[i - 1]
      const currentNode = hierarchy[i]

      if (!parent.children || !Array.isArray(parent.children)) {
        this.logger.log(`Level ${i}: No children in parent`)
        continue
      }

      const currentIndex = parent.children.findIndex(
        (c: any) => c.identifier === currentNode.identifier
      )

      if (currentIndex < 0) {
        this.logger.warn(`Level ${i}: Could not find current node in parent children`)
        continue
      }

      this.logger.log(`Level ${i}: Validating prerequisites`, {
        parentName: parent.name,
        currentNodeName: currentNode.name,
        currentIndexInParent: currentIndex,
        totalSiblingsAtThisLevel: parent.children.length,
        precedingSiblingsToCheck: currentIndex
      })

      // Check ALL preceding siblings at this level
      if (currentIndex > 0) {
        for (let j = 0; j < currentIndex; j++) {
          const sibling = parent.children[j]

          this.logger.log(`Prerequisite ${j}:`, {
            id: sibling.identifier,
            name: sibling.name,
            contentType: sibling.contentType,
            isCollection: this.isCollection(sibling),
            completionPercentage: sibling.completionPercentage,
            hasChildren: !!sibling.children && sibling.children.length > 0
          })

          // Check if this prerequisite sibling is complete
          const isPrerequisiteComplete = this.isSectionComplete(sibling)

          if (!isPrerequisiteComplete) {
            this.logger.error(`BLOCKED: Prerequisite not complete`, {
              siblingId: sibling.identifier,
              siblingName: sibling.name,
              contentType: sibling.contentType,
              isCollection: this.isCollection(sibling),
              completionPercentage: sibling.completionPercentage,
              reason: this.getIncompleteReason(sibling)
            })
            return false
          }

          this.logger.log(`Prerequisite complete:`, {
            id: sibling.identifier,
            name: sibling.name
          })
        }
      } else {
        this.logger.log(`Level ${i}: No preceding siblings - all prerequisites at this level are met`)
      }
    }

    this.logger.log('ALL prerequisites met - user CAN access this resource')
    return true
  }

  /**
   * Get human-readable reason why a section is incomplete
   */
  private getIncompleteReason(node: any): string {
    if (this.isCollection(node)) {
      const incompleteChildren = node.children?.filter((c: any) => {
        const completion = Number(c.completionPercentage) || 0
        return completion < 100
      }) || []
      return `Collection has ${incompleteChildren.length}/${node.children?.length || 0} incomplete children`
    } else {
      const completion = Number(node.completionPercentage) || 0
      if (completion === 0) {
        return `Resource not started (0% completion)`
      }
      return `Resource incomplete (${completion}% < 100%)`
    }
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
  //   this.logger.log('99999999', this.viewerDataSvc.primaryCategory, 'llllll')
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
  //       this.logger.log('viewr resolver===')
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
                  // Redirect to incomplete prerequisite resource or TOC if not accessible
                  if (validation.redirectParams) {
                    this.router.navigate([validation.redirectUrl], {
                      queryParams: validation.redirectParams
                    })
                  } else {
                    this.router.navigate([validation.redirectUrl])
                  }
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
