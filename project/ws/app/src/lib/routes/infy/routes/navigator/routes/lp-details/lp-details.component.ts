import { Component, OnInit } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { ActivatedRoute, Router } from '@angular/router'
import { BtnGoalsService, NsContentStripMultiple, NsGoal } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { TFetchStatus } from '@ws-widget/utils'
import { MultilineSnackbarComponent } from '../../components/multiline-snackbar/multiline-snackbar.component'
import { ICommonData, ICourse, ILpData, IPractiseCardModel, IProfile } from '../../models/navigator.model'
import { NavigatorService } from '../../services/navigator.service'

@Component({
  selector: 'ws-app-lp-details',
  templateUrl: './lp-details.component.html',
  styleUrls: ['./lp-details.component.scss'],
})
export class LpDetailsComponent implements OnInit {
  learningPath: ILpData
  courses: any[] = []
  practises: any[] = []
  availableCertifications: any[] = []
  selectedProfileId: any
  showProfile: boolean
  randomNumber: number
  currentDuration = 0
  fetchStatus: TFetchStatus = 'none'
  lpData: ILpData[] = this.route.snapshot.data.pageData.data.lp_data
  coursesFetched = false
  baseUrl = '/app/infy/navigator/lp'
  goalsAddingInProgess = false
  commonsData: ICommonData[] = []

  playgroundData: IPractiseCardModel[]
  certificationData: IPractiseCardModel[]

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
            title: 'Content',
            filters: [],
            request: {
              ids: [],
            },
          },
        ],
      },
    }
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private navSvc: NavigatorService,
    private snackBar: MatSnackBar,
    private btnGoalsSvc: BtnGoalsService,
  ) {
    this.randomNumber = 1
    this.playgroundData = []
    this.certificationData = []
    this.showProfile = this.route.snapshot.queryParams.showProfile
    // this.logger.log('datacheck ,', this.lpData, this.route.snapshot.params.id)

    this.learningPath = this.lpData.filter((lp: ILpData) => {
      return lp.lp_id === this.route.snapshot.params.id
    })[0]

    if (this.learningPath.profiles && this.learningPath.profiles.length > 0) {
      this.selectedProfileId =
        this.route.snapshot.queryParams.profile || this.learningPath.profiles[0].profile_id
    }

    this.fetchStatus = 'done'
    // this.logger.log('check it', this.learningPath)

    this.learningPath.lp_playground.forEach(playground => {
      const playData: IPractiseCardModel = {
        thumbnail: '/assets/images/content-card/card_img.jpg',
        title: playground.playground_name,
        description: playground.playground_description,
        routeButton: playground.playground_link,
      }
      this.playgroundData.push(playData)
    })

    this.fetchContentForProfile(this.selectedProfileId)
    // this.logger.log('play ground check', this.playgroundData)
  }

  ngOnInit() {
    this.navSvc.fetchCommonsData().subscribe(data => {
      this.commonsData = data.goal_data
    })

    this.learningPath.lp_internal_certification.forEach(certification => {
      const certificationData: IPractiseCardModel = {
        thumbnail: '/assets/images/content-card/card_img.jpg',
        title: certification.lp_internal_certification_name,
        description: certification.lp_internal_certification_description,
        routeButton: certification.lp_internal_certification_link,
      }
      this.certificationData.push(certificationData)
    })
    this.currentDuration = this.learningPath.profiles[0].profile_time
  }

  fetchContentForProfile(profileIndex: number) {
    const profiles: IProfile | undefined = this.learningPath.profiles.find(profile => {
      return profile.profile_id === Number(profileIndex)
    })
    if (profiles) {
      // this.logger.log('coure', profiles.courses_list)
      this.coursesResolverData.widgetData.strips.forEach(strip => {
        if (strip.key === 'courses-strip' && strip.request) {
          strip.request.ids = profiles.courses_list
        }
      })
      this.coursesResolverData = { ...this.coursesResolverData }
      // this.logger.log(this.coursesResolverData)

      this.coursesFetched = true
    }
  }

  onCourseClicked(courseId: string) {
    const course = this.courses.find(item => item.identifier === courseId)
    const url = course.link.replace('https://wingspan.com', '')
    this.router.navigateByUrl(url)
  }

  onPractiseClicked(practiceId: number) {
    const playItem = this.learningPath.lp_playground.find(
      item => item.playground_id === practiceId,
    )
    if (playItem) {
      const url = playItem.playground_link.replace('https://wingspan.com/', '')
      this.router.navigateByUrl(url)
    }
  }

  // certificationClicked(certificateId: string) {
  //   // const certification = this.availableCertifications.find(item => item.id === certificateId)
  //   // this.utilSvc
  //   //   .sendCertificationEmail(
  //   //     certification.certificationType,
  //   //     certification.title,
  //   //     certification.description,
  //   //     certification.certificationUrl,
  //   //   )
  //   //   .subscribe(
  //   //     data => {
  //   //       this.snackBar.open('A mail has been sent to you with more details')
  //   //     },
  //   //     _ => {
  //   //       this.snackBar.open('Error sending mail. Please try again later')
  //   //     },
  //   //   )
  // }

  openLearningPath() {
    this.router.navigateByUrl(this.baseUrl + this.learningPath.lp_id)
  }

  profileDescription(courses: ICourse[]) {
    return courses.map(course => course.course_name).join(', ')
  }

  onProfileChange(idx: number) {
    this.selectedProfileId = idx
    this.currentDuration = this.learningPath.profiles[idx].profile_time
    this.courses = []
    this.fetchContentForProfile(idx)
    this.generateRandomNumber()
  }

  generateRandomNumber() {
    this.randomNumber = Date.now()
  }

  createGoalClicked() {
    const resultLines: string[] = []
    this.goalsAddingInProgess = true
    const goalRequests: NsGoal.IGoalUpsertRequest[] = []

    const id = this.commonsData.find((commonData: ICommonData) => {
      return commonData.lp_id === this.route.snapshot.params.id
    })
    if (id) {
      const goals: NsGoal.IGoalUpsertRequest = {
        type: 'common',
        id: id.goal_id,
        duration: this.currentDuration,
      }

      goalRequests.push(goals)
    }
    // //console.log('requ', goalRequests)

    this.btnGoalsSvc.createGoals(goalRequests).subscribe(response => {
      for (let i = 0; i < response.length; i += 1) {
        const goalName = this.learningPath.lp_name
        if (response[i] === 'invalid.commongoal') {
          // this.loggerSvc.log(goalsData[i], 'failed')
          const res = `${goalName} is not launched yet`
          resultLines.push(res)
        } else if (response[i] === 'goal.alreadyexists') {
          const res = `${goalName} is already present in your Goals`
          resultLines.push(res)
        } else {
          // this.loggerSvc.log(goalsData[i], 'success')
          const res = `${goalName} Added Successfully`
          resultLines.push(res)
        }
      }
      // this.logger.log('results', resultLines)
      this.snackBar.openFromComponent(MultilineSnackbarComponent, {
        data: resultLines,
      })
      this.goalsAddingInProgess = false
    })
  }
}
