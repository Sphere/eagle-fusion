import { Component, OnInit } from '@angular/core'
import { NsContent } from '@ws-widget/collection'
import { TFetchStatus, ValueService } from '@ws-widget/utils'
import { IFsData, ILpData, INavigatorCardModel } from '../../models/navigator.model'
import { NavigatorService } from '../../services/navigator.service'

@Component({
  selector: 'ws-app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss'],
})
export class ExploreComponent implements OnInit {
  status: TFetchStatus = 'none'
  statusFs: TFetchStatus = 'none'
  lpData: INavigatorCardModel[]
  learningPathData: ILpData[] | undefined
  fsData: INavigatorCardModel[]
  fullStackData: IFsData[] | undefined
  smallScreen = false
  selectedIndex = 0
  isLtMedium$ = this.valueSvc.isLtMedium$
  screenSizeIsLtMedium = false

  lpDict = {} as any
  fsDict = {} as any

  constructor(private navSvc: NavigatorService, private valueSvc: ValueService) {
    this.lpData = []
    this.fsData = []

    this.navSvc.fetchLearningPathData().subscribe((response: ILpData[]) => {
      let data: ILpData[] = []
      if (response.length > 10) {
        data = response.slice(0, 10)
      } else {
        data = response
      }
      let count = 0
      // this.logger.log('data check', data)
      this.learningPathData = data
      // this.logger.log(this.learningPathData[0])
      this.learningPathData.forEach((lp: ILpData) => {
        const pathData: INavigatorCardModel = {
          title: lp.lp_name,
          routeButton: String(lp.lp_id),
          thumbnail: lp.lp_image,
          linkedIds: lp.linked_program,
          // temporary
          // thumbnail: '/assets/images/content-card/AngularDeveloper.jpg',
          description: lp.lp_description,
          type: 'lp',
        }
        this.lpDict[pathData.linkedIds] = pathData.thumbnail
        this.lpData[count] = pathData
        count += 1
      })

      const ids: string[] = []
      this.lpData.forEach(lp => {
        if (lp.linkedIds) {
          if (!lp.linkedIds.includes('/about') && !lp.linkedIds.includes('_na')) {
            ids.push(lp.linkedIds)
          }
        }
      })

      const finalIds = ids.splice(0, 150)
      finalIds.concat(ids.splice(300, 150))

      this.navSvc.fetchImageForContentIDs(finalIds).subscribe((resp: NsContent.IContent[]) => {
        resp.forEach(child => {
          this.lpDict[child.identifier] = child.appIcon
        })
        this.lpData.forEach(lp => {
          lp.thumbnail = this.lpDict[lp.linkedIds]
        })
        this.status = 'done'
      })
    })

    this.navSvc.fetchFullStackData().subscribe((response: IFsData[]) => {
      let data: IFsData[] = []
      if (response.length > 10) {
        data = response.slice(0, 10)
      } else {
        {
          data = response
        }
      }
      let count = 0
      // this.logger.log('data check fs', data)
      this.fullStackData = data
      this.fullStackData.forEach((fs: IFsData) => {
        const stackData: INavigatorCardModel = {
          title: fs.fs_name,
          linkedIds: fs.fs_linked_program,
          routeButton: String(fs.fs_id),
          thumbnail: fs.fs_image,
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
        this.statusFs = 'done'
      })
    })
  }

  ngOnInit() {
    this.isLtMedium$.subscribe((isLtMedium: boolean) => {
      this.screenSizeIsLtMedium = isLtMedium
    })
  }
}
