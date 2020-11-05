import { Component, OnInit } from '@angular/core'
import { IWidgetsPlayerMediaData } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ConfigurationsService, NsPage } from '../../../../../../../../library/ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-app-about-video',
  templateUrl: './about-video.component.html',
  styleUrls: ['./about-video.component.scss'],
})
export class AboutVideoComponent implements OnInit {
  introVideos: any
  isPartOfFirstTimeSetupV2 = false
  locale = ''
  appName = ''
  showNextbutton = false
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  objectKeys = Object.keys
  widgetResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
    IWidgetsPlayerMediaData
  > = {
      widgetData: {
        url: '',
        autoplay: true,
        identifier: '',
      },
      widgetHostClass: 'video-full block',
      widgetSubType: 'playerVideo',
      widgetType: 'player',
      widgetHostStyle: {
        height: '100%',
        'max-width': '90%',
        'margin-left': 'auto',
        'margin-right': 'auto',
      },
    }

  constructor(private configSvc: ConfigurationsService) { }

  ngOnInit() {
    if (this.configSvc.instanceConfig) {
      this.introVideos = this.configSvc.instanceConfig.introVideo
      this.appName = this.configSvc.instanceConfig.details.appName

    } if (this.configSvc.restrictedFeatures
      && !this.configSvc.restrictedFeatures.has('firstTimeSetupV2')) {
      this.isPartOfFirstTimeSetupV2 = true
    }

    this.locale = this.configSvc.userPreference && this.configSvc.userPreference.selectedLocale || ''
    this.locale = Object.keys(this.introVideos).includes(this.locale) ? this.locale : 'en'
    this.widgetResolverData = {
      ...this.widgetResolverData,
      widgetData: {
        ...this.widgetResolverData.widgetData,
        url: this.introVideos[this.locale],
      },
    }
    if (this.configSvc.restrictedFeatures && !this.configSvc.restrictedFeatures.has('firstTimeSetupV2')) {
      this.showNextbutton = true
    }
  }

  onItemChange(value: string) {
    this.widgetResolverData = {
      ...this.widgetResolverData,
      widgetData: {
        ...this.widgetResolverData.widgetData,
        url: this.introVideos[value],
      },
    }
    // this.widgetResolverData.widgetData.url = this.introVideos[value]
    // //console.log('TYPE: ', this.widgetResolverData)
  }

}
