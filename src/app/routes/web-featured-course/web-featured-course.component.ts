import { Component, OnInit, Input } from '@angular/core'
import { Router } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { ConfigurationsService } from '@ws-widget/utils'
import { Title } from '@angular/platform-browser'

@Component({
    standalone: false,
    selector: 'ws-web-featured-course',
    templateUrl: './web-featured-course.component.html',
    styleUrls: ['./web-featured-course.component.scss'],
    
})
export class WebFeaturedCourseComponent implements OnInit {
  @Input() courseData: any
  videoData: any
  firstName: any
  isLoggedIn = false
  // languageIcon = '../../../fusion-assets/images/lang-icon.png'
  langDialog: any
  preferedLanguage: any = { id: 'en', lang: 'English' }
  isFeaturedCourse!: boolean
  constructor(
    private router: Router,
    public dialog: MatDialog,
    public configSvc: ConfigurationsService,
    private titleService: Title

  ) {
    if (localStorage.getItem('orgValue') === 'nhsrc') {
      this.router.navigateByUrl('/organisations/home')
    }
  }

  ngOnInit() {
    if (this.configSvc.userProfile) {
      this.isLoggedIn = true
    } else {
      this.isLoggedIn = false
    }
    let data: any
    data = localStorage.getItem('preferedLanguage')
    if (data) {
      if (JSON.parse(data).selected === true) {
        this.preferedLanguage = JSON.parse(data)
      }
    } else {
      if (this.router.url.includes('hi')) {
        this.preferedLanguage = { id: 'hi', lang: 'हिंदी' }
      }
    }

  }
  login(data: any) {
    const name = `${data.name} - Aastrika`
    this.titleService.setTitle(name)

    const slug = this.slugify(data.name)
    const courseId = data.identifier

    this.router.navigate(['/public/toc/overview', courseId, slug], {
      state: {
        tocData: data,
      },
    })

    localStorage.setItem('tocData', JSON.stringify(data))
    localStorage.setItem(`url_before_login`, `app/toc/${courseId}/overview`)
  }

  // Helper function to slugify the course name
  slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')   // Replace spaces/symbols with hyphen
      .replace(/^-+|-+$/g, '')       // Remove starting/ending hyphens
  }


}
