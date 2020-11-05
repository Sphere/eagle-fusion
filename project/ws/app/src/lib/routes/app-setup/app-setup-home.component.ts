import { MatDialog } from '@angular/material'
import { StepperSelectionEvent, STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper'
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core'
import { IWidgetsPlayerMediaData } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ConfigurationsService } from '../../../../../../../library/ws-widget/utils/src/public-api'
import { InterestComponent } from '../profile/routes/interest/components/interest/interest.component'
import { SettingsComponent } from '../profile/routes/settings/settings.component'

@Component({
  selector: 'ws-app-app-setup-home',
  templateUrl: './app-setup-home.component.html',
  styleUrls: ['./app-setup-home.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class AppSetupHomeComponent implements OnInit, AfterViewInit {
  currentIndex = 0
  appLanguage = ''
  chosenLang = ''
  introVideos: any
  objectKeys = Object.keys

  // isInterestEnabled = true

  widgetResolverData: NsWidgetResolver.IRenderConfigWithTypedData<IWidgetsPlayerMediaData> = {
    widgetData: {
      url: '',
      autoplay: true,
      identifier: '',
    },
    widgetHostClass: 'video-full block',
    widgetSubType: 'playerVideo',
    widgetType: 'player',
    widgetHostStyle: {
      height: '350px',
    },
  }

  @ViewChild('userInterest', { static: false }) interestCompRef:
    | InterestComponent
    | undefined = undefined

  @ViewChild('userSettings', { static: false }) settingsCompRef:
    | SettingsComponent
    | undefined = undefined

  constructor(private configSvc: ConfigurationsService, private matDialog: MatDialog) {}

  ngOnInit(): void {
    // if (this.configSvc.restrictedFeatures) {
    //   this.isInterestEnabled = !this.configSvc.restrictedFeatures.has('interests')
    // }

    this.appLanguage = (this.configSvc.activeLocale && this.configSvc.activeLocale.path) || ''
    if (this.configSvc.instanceConfig) {
      this.introVideos = this.configSvc.instanceConfig.introVideo
      // //console.log('TYPE: ', this.introVideos)
    }
    this.widgetResolverData = {
      ...this.widgetResolverData,
      widgetData: {
        ...this.widgetResolverData.widgetData,
        url: this.introVideos['en'],
      },
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.interestCompRef) {
        this.interestCompRef.fetchUserInterests()
      }
      // tslint:disable-next-line: align
    }, 0)
  }

  prevBtn() {
    this.currentIndex -= 1
  }

  nextBtn() {
    this.currentIndex += 1
  }

  onChange(event: StepperSelectionEvent) {
    this.currentIndex = event.selectedIndex
  }

  langChanged(path: string) {
    this.chosenLang = path
  }

  applyChanges(template: any) {
    if (this.configSvc.userUrl) {
      const dialog = this.matDialog.open(template, {
        width: '400px',
        backdropClass: 'backdropBackground',
      })
      dialog.afterClosed().subscribe(v => {
        if (!v) {
          this.configSvc.userUrl = ''
        }
        if (this.settingsCompRef) {
          this.settingsCompRef.applyChanges()
        }
      })
    } else {
      if (this.settingsCompRef) {
        this.settingsCompRef.applyChanges()
      }
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
