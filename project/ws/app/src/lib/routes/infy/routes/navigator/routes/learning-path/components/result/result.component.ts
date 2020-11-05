import { Component, OnChanges, OnInit } from '@angular/core'
import { MatListOption, MatSnackBar } from '@angular/material'
import { ActivatedRoute, Router } from '@angular/router'
import { BtnGoalsService, NsGoal } from '@ws-widget/collection'
import { ConfigurationsService, TFetchStatus, ValueService } from '@ws-widget/utils'
import { map } from 'rxjs/operators'
import { MultilineSnackbarComponent } from '../../../../components/multiline-snackbar/multiline-snackbar.component'
import { ICommonData, ILpData, INavigatorFilter, IProfile } from '../../../../models/navigator.model'
import { NavigatorService } from '../../../../services/navigator.service'

@Component({
  selector: 'ws-app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
})
export class ResultComponent implements OnInit, OnChanges {
  technologies: string[]
  status: TFetchStatus = 'none'
  sideNavBarOpenedUser = true
  skillsList: string[]
  suggestedLp: any[] = []
  otherLp: any[] = []
  filterList: INavigatorFilter[]
  shouldClipSuggested = false
  shouldClipOthers = false
  displayLessSuggested = false
  displayLessOthers = false
  goalsAddingInProgess = false
  commonsData: ICommonData[] = []

  isLtMedium$ = this.valueSvc.isLtMedium$
  lpdata: ILpData[] = this.route.snapshot.data.lpdata.data
  screenSizeIsLtMedium = false
  sideNavBarOpened = false
  suggestedClip: any[] = []
  otherClip: any[] = []

  mode$ = this.isLtMedium$.pipe(map(isMedium => (isMedium ? 'over' : 'side')))

  // isNavigatorGoalsStatus = this.configSvc.instanceConfig.features.navigator.subFeatures
  //   .navigatorGoals

  // private defaultSideNavBarOpenedSubscription: Subscription | undefined
  defaultThumbnail = '/assets/images/missing-thumbnail.png'

  constructor(
    private navSvc: NavigatorService,
    private valueSvc: ValueService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private btnGoalsSvc: BtnGoalsService,
    private configSvc: ConfigurationsService,
  ) {
    this.technologies = []
    this.skillsList = []
    this.filterList = []
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params.selection) {
        this.skillsList = params.selection.split(',').filter((item: string) => item.length)
        this.suggestedLp = []
        this.otherLp = []
        this.clipLists()

      }
      if (!this.skillsList.length) {
        this.skillsList.push('Web Development')
      }
      this.lpdata.forEach(lp => {
        this.navSvc.fetchImageForContentID(lp.linked_program).subscribe(res => {
          lp.lp_image = res[0].appIcon
        })
      })
      // this.loggerSvc.log('LP data check', this.lpdata)
      Object.values(this.lpdata).forEach((lp: any) => {
        const allTech: string[] = []
        lp.profiles.forEach((profile: IProfile) => allTech.push(...profile.technology))
        if (this.hasCommonTech(this.skillsList, allTech)) {
          this.suggestedLp.push(lp)
        } else {
          this.otherLp.push(lp)
        }
      })
    })

    this.navSvc.fetchNavigatorTopics().subscribe((data: string[]) => {
      this.technologies = data
      this.status = 'done'
      // this.loggerSvc.log('data fetched', this.technologies, this.status)
      this.initializeFilterList()
    })

    this.navSvc.fetchCommonsData().subscribe(data => {
      this.commonsData = data.goal_data
      // this.loggerSvc.log('Commons Data', this.commonsData)
    })

    this.clipLists()
    if (this.configSvc.instanceConfig) {
      this.defaultThumbnail = this.configSvc.instanceConfig.logos.defaultContent
    }
    this.isLtMedium$.subscribe((isLtMedium: boolean) => {
      this.sideNavBarOpened = !isLtMedium
      this.screenSizeIsLtMedium = isLtMedium
    })
  }

  ngOnChanges() {
    this.clipLists()
  }
  hasCommonTech(arr1: string[], arr2: string[]) {
    return arr1.filter(value => -1 !== arr2.indexOf(value)).length > 0
  }

  clipLists() {
    if (this.suggestedLp.length > 6) {
      this.suggestedClip = this.suggestedLp
      this.suggestedLp = this.suggestedClip.splice(0, 6)
      this.shouldClipSuggested = true
    }
    if (this.otherLp.length > 6) {
      this.otherClip = this.otherLp
      this.otherLp = this.otherLp.splice(0, 6)
      this.shouldClipOthers = true
    }
  }

  initializeFilterList() {
    let data: INavigatorFilter
    this.technologies.forEach((tech: string) => {
      if (this.skillsList.includes(tech)) {
        data = { technologyName: tech, checked: true }
      } else {
        data = { technologyName: tech, checked: false }
      }
      this.filterList.push(data)
    })
    // this.snackBar.open('Select your Learning Paths')
  }

  removeSkill(skill: string) {
    this.skillsList = this.skillsList.filter(item => item !== skill)
    this.router.navigate(['/app/infy/navigator/tech/learning-path/result'], {
      queryParams: { selection: this.skillsList.join(',') },
    })
  }

  addSkill(skill: string) {
    if (!this.skillsList.includes(skill)) {
      this.skillsList.push(skill)
      this.router.navigate(['/app/infy/navigator/tech/learning-path/result'], {
        queryParams: {
          selection: this.skillsList.join(','),
        },
      })
    }
  }

  viewMoreLp(type: string) {
    if (type === 'suggested' && this.suggestedClip.length) {
      const lp = this.suggestedClip.splice(0, 6)
      this.suggestedLp = this.suggestedLp.concat(lp)
      if (!this.suggestedClip.length) {
        this.shouldClipSuggested = false
      }
      if (this.suggestedLp.length > 6) {
        this.displayLessSuggested = true
      }
    }
    if (type === 'other' && this.otherClip.length) {
      const lp = this.otherClip.splice(0, 6)
      this.otherLp = this.otherLp.concat(lp)

      if (!this.otherClip.length) {
        this.shouldClipOthers = false
      }
      if (this.otherLp.length > 6) {
        this.displayLessOthers = true
      }
    }
  }

  viewLessLp(type: string) {
    if (type === 'suggested' && this.suggestedLp.length > 6) {
      const lp = this.suggestedLp.splice(this.suggestedLp.length - 6, 6)
      this.suggestedClip = this.suggestedClip.concat(lp)

      if (this.suggestedLp.length <= 6) {
        this.displayLessSuggested = false
      }
      if (this.suggestedClip.length) {
        this.shouldClipSuggested = true
      }
    }
    if (type === 'other' && this.otherLp.length > 6) {
      const lp = this.otherLp.splice(this.otherLp.length - 6, 6)
      this.otherClip = this.otherClip.concat(lp)

      if (this.otherLp.length <= 6) {
        this.displayLessOthers = false
      }
      if (this.otherClip.length) {
        this.shouldClipOthers = true
      }
    }
  }

  techChange(technology: string) {
    let count = 0
    this.filterList.forEach((tech: INavigatorFilter) => {
      if (tech.technologyName === technology) {
        this.filterList[count].checked = !this.filterList[count].checked
      }
      if (this.filterList[count].checked) {
        this.addSkill(this.filterList[count].technologyName)
      } else {
        this.removeSkill(this.filterList[count].technologyName)
      }
      count += 1
    })
  }

  createGoalClicked(selectedLp: any, type: string) {
    const resultLines: string[] = []
    this.goalsAddingInProgess = true
    const goalRequests: NsGoal.IGoalUpsertRequest[] = []

    const goalsData = selectedLp.map((option: MatListOption) => String(option.value))

    if (type === 'suggested') {
      goalsData.forEach((goal: string) => {
        const duration = this.suggestedLp.find((lpdata: ILpData) => {
          return lpdata.lp_id === Number(goal)
        }).profiles[0].profile_time
        // //console.log('duration', duration)
        const id = this.commonsData.find((commonData: ICommonData) => {
          return commonData.lp_id === goal
        })
        if (id) {
          const goals: NsGoal.IGoalUpsertRequest = {
            duration: parseInt(duration, 0),
            id: id.goal_id,
            type: 'common',
          }
          goalRequests.push(goals)
        }
      })
    } else {
      goalsData.forEach((goal: string) => {
        const duration = this.otherLp.find((lpdata: ILpData) => {
          return lpdata.lp_id === Number(goal)
        }).profiles[0].profile_time
        // //console.log('duration', duration)
        const id = this.commonsData.find((commonData: ICommonData) => {
          return commonData.lp_id === goal
        })
        if (id) {
          const goals: NsGoal.IGoalUpsertRequest = {
            duration: parseInt(duration, 0),
            id: id.goal_id,
            type: 'common',
          }
          goalRequests.push(goals)
        }
      })
    }

    // //console.log('Goal requests', goalRequests)

    if (!goalRequests.length) {
      this.goalsAddingInProgess = false
      this.snackBar.open('Goal not launched yet')
    } else {

      this.btnGoalsSvc.createGoals(goalRequests).subscribe(response => {
        for (let i = 0; i < response.length; i += 1) {
          let goalName = ''
          if (type === 'suggested') {
            goalName = this.suggestedLp.find((lpdata: ILpData) => {
              return lpdata.lp_id === Number(goalsData[i])
            }).lp_name
          } else {
            goalName = this.otherLp.find((lpdata: ILpData) => {
              return lpdata.lp_id === Number(goalsData[i])
            }).lp_name
          }
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
        // this.loggerSvc.log('results', resultLines)
        this.snackBar.openFromComponent(MultilineSnackbarComponent, {
          data: resultLines,
        })
        this.goalsAddingInProgess = false
      })
    }
  }
}
