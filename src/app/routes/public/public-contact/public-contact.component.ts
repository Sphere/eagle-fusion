import { Component, OnInit, OnDestroy } from '@angular/core'
import { ConfigurationsService, NsPage } from '@ws-widget/utils'
import { HttpClient } from '@angular/common/http'
import { Subscription } from 'rxjs'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'ws-public-contact',
  templateUrl: './public-contact.component.html',
  styleUrls: ['./public-contact.component.scss'],
})
export class PublicContactComponent implements OnInit, OnDestroy {
  contactUsMail = ''
  contactPage: any
  platform = 'Wingspan'
  panelOpenState = false
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  private subscriptionContact: Subscription | null = null
  private contactPageS3Url = 'https://aastar-assets.s3.ap-south-1.amazonaws.com/data/contact-page-content.json'

  constructor(
    private configSvc: ConfigurationsService,
    private activateRoute: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit() {
    // ✅ Load contact page from S3
    this.loadContactPageFromS3()

    if (this.configSvc.instanceConfig) {
      this.contactUsMail = this.configSvc.instanceConfig.mailIds.contactUs
    }
  }

  private loadContactPageFromS3() {
    // Add cache buster with current timestamp to always fetch latest version
    const cacheBuster = new Date().getTime()
    const s3UrlWithCache = `${this.contactPageS3Url}?v=${cacheBuster}`

    console.log('Loading contact page from S3:', s3UrlWithCache)

    this.http.get(s3UrlWithCache).subscribe(
      (data: any) => {
        this.contactPage = data
        console.log('Contact page loaded from S3:', data)
        console.log('Account Deletion Data:', this.contactPage?.accountDeletion)
        console.log('Contact Data:', this.contactPage?.contact)
      },
      (error: any) => {
        console.error('Failed to load contact page from S3, trying local assets:', error)
        // Fallback 1: Try local assets
        this.http.get('assets/contact-page-content.json').subscribe(
          (data: any) => {
            this.contactPage = data
            console.log('Loaded contact page from local assets:', data)
          },
          (assetsError: any) => {
            console.error('Failed to load from local assets, trying resolver:', assetsError)
            // Fallback 2: try to load from resolver data
            this.subscriptionContact = this.activateRoute.data.subscribe(data => {
              if (data && data.pageData && data.pageData.data) {
                this.contactPage = data.pageData.data
                console.log('Using fallback data from resolver')
              }
            })
          }
        )
      }
    )
  }

  ngOnDestroy() {
    if (this.subscriptionContact) {
      this.subscriptionContact.unsubscribe()
    }
  }
}

