import { Component, OnInit } from '@angular/core'
import { TFetchStatus, ConfigurationsService } from '@ws-widget/utils'
import { NavigatorService } from '../../services/navigator.service'
import { IFsData, INavigatorCardModel } from '../../models/navigator.model'
import { Router } from '@angular/router'
import { NsContent } from '@ws-widget/collection'

@Component({
  selector: 'ws-app-fs-home',
  templateUrl: './fs-home.component.html',
  styleUrls: ['./fs-home.component.scss'],
})
export class FsHomeComponent implements OnInit {
  fsData: INavigatorCardModel[]
  fullStackData: IFsData[]
  fetchStatus: TFetchStatus = 'none'
  defaultThumbnail = '/assets/images/missing-thumbnail.png'
  baseFsUrl = '/app/infy/navigator/fs/program/'
  fsDict = {} as any

  constructor(
    private navSvc: NavigatorService,
    private router: Router,
    private configSvc: ConfigurationsService,
  ) {
    this.fsData = []
    this.fullStackData = []
  }

  ngOnInit() {
    if (this.configSvc.instanceConfig) {
      this.defaultThumbnail = this.configSvc.instanceConfig.logos.defaultContent
    }
    this.navSvc.fetchFullStackData().subscribe((data: IFsData[]) => {
      this.fullStackData = data

      let count = 0
      // this.logger.log('data check fs', data)
      this.fullStackData = data
      this.fullStackData.forEach((fs: IFsData) => {
        const stackData: INavigatorCardModel = {
          title: fs.fs_name,
          routeButton: String(fs.fs_id),
          thumbnail: fs.fs_image,
          linkedIds: fs.fs_linked_program,
          // temporary
          // thumbnail: '/assets/images/content-card/AngularDeveloper.jpg',
          description: fs.fs_desc,
          type: 'fs',
        }
        this.fsDict[stackData.linkedIds] = stackData.thumbnail
        this.fsData[count] = stackData
        count += 1
      })
      const ids: string[] = []
      this.fsData.forEach(fs => {
        if (!fs.linkedIds.includes('/about')) {
          ids.push(fs.linkedIds)
        }
      })

      this.navSvc.fetchImageForContentIDs(ids).subscribe((resp: NsContent.IContent[]) => {
        resp.forEach(child => {
          this.fsDict[child.identifier] = child.appIcon
        })
        this.fsData.forEach(fs => {
          fs.thumbnail = this.fsDict[fs.linkedIds]
        })
        this.fetchStatus = 'done'
      })

    })
  }
  imageClicked(navigateRoute: string) {
    this.router.navigate([this.baseFsUrl + navigateRoute])
  }
}
