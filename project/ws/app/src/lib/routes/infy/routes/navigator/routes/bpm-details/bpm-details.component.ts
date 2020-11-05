import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { NsContent, NsContentStripMultiple } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils'
import { IBpmData } from '../../models/navigator.model'
import { NavigatorService } from '../../services/navigator.service'

@Component({
  selector: 'ws-app-bpm-details',
  templateUrl: './bpm-details.component.html',
  styleUrls: ['./bpm-details.component.scss'],
})
export class BpmDetailsComponent implements OnInit {
  fetchStatus: TFetchStatus = 'none'
  coursesFetch: TFetchStatus = 'none'
  groupMemberId: number
  bpmData: IBpmData[] = []
  hasExternal = true

  defaultThumbnail = ''

  selectedBpmData: IBpmData = {} as any

  coursesResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  > = {
    widgetType: 'contentStrip',
    widgetSubType: 'contentStripMultiple',
    widgetData: {
      strips: [
        {
          key: 'courses-strip',
          preWidgets: [],
          title: 'Courses',
          filters: [],
          request: {
            ids: [],
          },
        },
      ],
    },
  }

  constructor(
    public configSvc: ConfigurationsService,
    private navSvc: NavigatorService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.groupMemberId = this.route.snapshot.queryParams.id
  }

  ngOnInit() {
    if (this.configSvc.instanceConfig) {
      this.defaultThumbnail = this.configSvc.instanceConfig.logos.defaultContent
    }

    this.navSvc.fetchBpmData().subscribe((res: any) => {
      this.bpmData = res.data
      // console.log(res.data)
      const bpmSelected = this.bpmData.find(bpm => {
        return bpm.groupd_id === Number(this.groupMemberId)
      })
      if (bpmSelected) {
        this.selectedBpmData = bpmSelected
      }

      if (this.selectedBpmData.member_list_internal) {
        this.coursesResolverData.widgetData.strips.forEach(strip => {
          if (strip.key === 'courses-strip' && strip.request) {
            strip.request.ids = this.selectedBpmData.member_list_internal
          }
        })
        this.coursesResolverData = { ...this.coursesResolverData }
        this.coursesFetch = 'done'
      }

      const ids: string[] = []
      this.selectedBpmData.member_list_external.forEach(externalMember => {
        ids.push(externalMember.member_image_id)
      })

      if (ids.length > 0) {
        this.navSvc.fetchImageForContentIDs(ids).subscribe(
          (resp: NsContent.IContent[]) => {
            resp.forEach(child => {
              this.selectedBpmData.member_list_external.forEach(externalMember => {
                if (externalMember.member_image_id === child.identifier) {
                  externalMember.member_image_id = child.appIcon
                  // externalMember.member_linked_url = encodeURIComponent(externalMember.member_linked_url)
                }
              })
            })
            this.fetchStatus = 'done'
            this.hasExternal = true
          },
          () => {
            this.fetchStatus = 'done'
            this.hasExternal = false
          },
        )
      }
    })
  }

  changeRoute(url: string) {
    // console.log('the url', url)
    // console.log(decodeURIComponent(url))
    if (url.includes('role-details')) {
      const splittedUrl = url.split('?id=')
      const roleId = splittedUrl[1]
      this.router.navigate([splittedUrl[0]], { queryParams: { id: roleId } })
    } else if (url.includes('variant')) {
      const splittedUrl = url.split('?variant=')
      const variantId = splittedUrl[1]
      this.router.navigate([splittedUrl[0]], { queryParams: { variant: variantId } })
    } else {
      this.router.navigate([decodeURIComponent(url)])
    }
  }

  // private isUrlEncoded(url: string): boolean {
  //   const receivedUrl = url || ''
  //   return receivedUrl !== decodeURIComponent(receivedUrl)
  // }
}
