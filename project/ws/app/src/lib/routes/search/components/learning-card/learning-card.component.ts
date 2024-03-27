import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { NsContent } from '@ws-widget/collection'
import { ConfigurationsService } from '@ws-widget/utils'
import { SafeHtml, DomSanitizer } from '@angular/platform-browser'
import { Router } from '@angular/router'
import { UserProfileService } from '../../../user-profile/services/user-profile.service'
import { NsCardContent } from '../../../../../../../../../library/ws-widget/collection/src/lib/card-content/card-content.model'
import { of } from 'rxjs'
import { delay, mergeMap } from 'rxjs/operators'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
//import { v4 as uuid } from 'uuid'
import { AuthKeycloakService } from 'library/ws-widget/utils/src/lib/services/auth-keycloak.service'
import forEach from 'lodash/forEach'
import get from 'lodash/get'
@Component({
  selector: 'ws-app-learning-card',
  templateUrl: './learning-card.component.html',
  styleUrls: ['./learning-card.component.scss'],
})
export class LearningCardComponent extends WidgetBaseComponent
  implements OnInit, OnChanges, NsWidgetResolver.IWidgetData<NsCardContent.ICard> {
  @Input()
  displayType: 'basic' | 'advanced' = 'basic'
  @Input()
  content: NsContent.IContent = {} as NsContent.IContent
  @Input() widgetData!: NsCardContent.ICard
  contentProgress = 0
  isExpanded = false
  defaultThumbnail = ''
  description: SafeHtml = ''
  redirectUrl = ''
  cometencyData: { name: any; levels: string }[] = []
  constructor(
    private configSvc: ConfigurationsService,
    private domSanitizer: DomSanitizer,
    private router: Router,
    private userProfileSvc: UserProfileService,
    private authSvc: AuthKeycloakService
  ) { super() }

  ngOnInit() {
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.defaultThumbnail = instanceConfig.logos.defaultContent
    }

    // this.redirectUrl = document.baseURI + 'openid/keycloak'
    const url = `${document.baseURI}openid/keycloak`
    this.redirectUrl = url
    if (this.content.competencies_v1 && Object.keys(this.content.competencies_v1).length > 0) {

      forEach(JSON.parse(this.content.competencies_v1), (value: any) => {
        if (value.level) {
          this.cometencyData.push(
            {
              name: value.competencyName,
              levels: ` Level ${value.level}`,
            }
          )
        }
        return this.cometencyData
      })
    }

  }
  ngOnChanges(changes: SimpleChanges) {
    for (const prop in changes) {
      if (prop === 'content' && this.content.description) {
        this.content.description = this.content.description.replace(/<br>/g, '')
        this.description = this.domSanitizer.bypassSecurityTrustHtml(this.content.description)
      }
    }
  }

  raiseTelemetry(content: any) {
    const url = `app/toc/` + `${content.identifier}` + `/overview`
    let wholeUrl = `${document.baseURI}`
    // let redirectUrl = ''
    sessionStorage.setItem('url', url)
    if (wholeUrl.includes('hi')) {
      wholeUrl = url.replace('hi/', '')
      this.redirectUrl = `${wholeUrl}openid/keycloak`
      sessionStorage.setItem('lang', 'hi')
    } else {
      this.redirectUrl = `${wholeUrl}openid/keycloak`
    }
    if (localStorage.getItem('telemetrySessionId') === null) {
      localStorage.setItem(`url_before_login`, url)
      // this.router.navigateByUrl('app/login')
      // const state = uuid()
      // const nonce = uuid()
      sessionStorage.setItem('login-btn', 'clicked')
      // tslint:disable-next-line:max-line-length
      // const keycloakurl = `${wholeUrl}auth/realms/sunbird/protocol/openid-connect/auth?client_id=portal&redirect_uri=${encodeURIComponent(this.redirectUrl)}&state=${state}&response_mode=fragment&response_type=code&scope=openid&nonce=${nonce}`
      //window.location.href = keycloakurl
      location.href = '/public/login'
      this.authSvc.login('S', this.redirectUrl)
    } else {
      // this.router.navigateByUrl(url)
      if (this.configSvc.unMappedUser) {
        this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).pipe(delay(500), mergeMap((data: any) => {
          return of(data)
        })).subscribe((userDetails: any) => {
          if (this.userProfileSvc.isBackgroundDetailsFilled(get(userDetails, 'profileDetails.profileReq'))) {
            this.router.navigateByUrl(url)
          } else {
            const courseUrl = `/app/toc/${content.identifier}/overview`
            this.router.navigate(['/app/about-you'], { queryParams: { redirect: courseUrl } })
          }
        })
      }
    }
  }
}
