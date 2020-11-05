import { Component, OnInit } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { ActivatedRoute } from '@angular/router'
import { BtnGoalsService, NsContent, NsContentStripMultiple, NsGoal, WidgetContentService } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ConfigurationsService, TFetchStatus } from '@ws-widget/utils'
import { MultilineSnackbarComponent } from '../../components/multiline-snackbar/multiline-snackbar.component'
// tslint:disable-next-line: max-line-length
import { ICommonData, IFsCardModel, IGroup, IGroupMember, ILpCertification, ILpData, IOfferings, IRole, IVariant } from '../../models/navigator.model'
import { NavigatorService } from '../../services/navigator.service'

@Component({
  selector: 'ws-app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
})
export class RoleComponent implements OnInit {
  roleId: string
  variantId: string
  learningPathData: ILpData[]
  rolesData!: IOfferings
  allRoles: IRole[]
  selectedRole: IRole
  selectedVariant: IVariant
  groupMemberData: any[]
  goalsAddingInProgess = false
  groupMemberIndex = 0
  defaultThumbnail = '/assets/images/missing-thumbnail-playlist.png'
  allLpData: ILpData[] = []
  fetchStatus: TFetchStatus = 'none'
  commonsData: ICommonData[] = []
  certificationsData: IFsCardModel[]
  selectedMemberList: string[] = []
  strips: any[] = []
  hasAlternatives = false
  hasCertifications = false

  showAlternatives = false

  certificationsResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  > = {
      widgetType: 'contentStrip',
      widgetSubType: 'contentStripMultiple',
      widgetData: {
        strips: [
          {
            key: 'certifications-strip',
            preWidgets: [],
            title: '',
            filters: [],
            request: {
              ids: [],
            },
          },
        ],
      },
    }

  alternateCertificationsResolverData: NsWidgetResolver.IRenderConfigWithTypedData<
    NsContentStripMultiple.IContentStripMultiple
  > = {
      widgetType: 'contentStrip',
      widgetSubType: 'contentStripMultiple',
      widgetData: {
        strips: [
        ],
      },
    }

  constructor(
    private route: ActivatedRoute,
    private navSvc: NavigatorService,
    private btnGoalsSvc: BtnGoalsService,
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
    private contentSvc: WidgetContentService,

  ) {
    this.allRoles = []
    this.learningPathData = []
    this.groupMemberData = []
    this.selectedRole = {
      role_description: '',
      role_id: '',
      role_image: '',
      variants: [],
      role_name: '',
      roles_defined: false,
      courses_available: false,
    }

    this.selectedVariant = {
      variant_id: '',
      variant_image: '',
      variant_description: '',
      variant_name: '',
    }

    this.certificationsData = []

    this.roleId = this.route.snapshot.params.id
    this.variantId = this.route.snapshot.queryParams.variant

    this.navSvc.fetchNavigatorRoles().subscribe((data: IOfferings) => {
      this.rolesData = data
      this.findRole()
    })

    this.navSvc.fetchRolesVariantData(this.roleId, this.variantId).subscribe((data: IVariant) => {
      this.selectedVariant = data
      // //console.log('var', this.selectedVariant)

      if (this.selectedVariant.group) {
        this.selectedVariant.group.forEach((group: IGroup) => {
          const linkedLpData: ILpData[] = []
          group.group_member.forEach((member: IGroupMember) => {
            let matchedLp: ILpData
            this.navSvc
              .fetchLearningPathIdData(String(member.lp_linked_id))
              .subscribe((lpResult: ILpData) => {
                matchedLp = lpResult
                linkedLpData.push(matchedLp)
                this.navSvc.fetchImageForContentID(matchedLp.linked_program).subscribe(
                  res => {
                    matchedLp.lp_image = res[0].appIcon
                  },
                  () => { })
                this.allLpData.push(matchedLp)
              })
          })
          this.groupMemberData.push(linkedLpData)
        })
      }
      // //console.log('groupM', this.groupMemberData)
      this.getCertificationsData(this.selectedVariant)
      this.fetchStatus = 'done'
    })
  }

  // getProfileTime(profiles: IProfile[], profileId: number) {
  //   return profiles.find(profile => profile.profile_id === profileId).profile_time
  // }

  ngOnInit() {
    this.navSvc.fetchCommonsData().subscribe(data => {
      this.commonsData = data.goal_data
    })
    if (this.configSvc.instanceConfig) {
      this.defaultThumbnail = this.configSvc.instanceConfig.logos.defaultContent
    }
  }

  findRole() {
    const offeringRoles = []
    offeringRoles.push(this.rolesData.Accelerate.roles)
    offeringRoles.push(this.rolesData.Assure.roles)
    offeringRoles.push(this.rolesData.Experience.roles)
    offeringRoles.push(this.rolesData.Innovate.roles)
    offeringRoles.push(this.rolesData.Insight.roles)

    offeringRoles.forEach(roles => {
      roles.forEach(roleData => {
        this.allRoles.push(roleData)
      })
    })

    const role = this.allRoles.find((roleData: IRole) => {
      return roleData.role_id === this.roleId
    })
    if (role) {
      this.selectedRole = role
      // //console.log('selected role', role)
    }
  }

  createGoalClicked(group: IGroup) {
    let linkedId: number
    if (group.group_member.length > 1) {
      // //console.log('Goal Attack', group.group_member[this.groupMemberIndex].lp_linked_id)
      linkedId = group.group_member[this.groupMemberIndex].lp_linked_id
    } else {
      // //console.log('Selected Member', group.group_member[0].lp_linked_id)
      linkedId = group.group_member[0].lp_linked_id
    }
    const resultLines: string[] = []
    this.goalsAddingInProgess = true
    const goalRequests: NsGoal.IGoalUpsertRequest[] = []

    const id = this.commonsData.find((commonData: ICommonData) => {
      return commonData.lp_id === String(linkedId)
    })
    if (id) {
      const goals: NsGoal.IGoalUpsertRequest = {
        type: 'common',
        id: id.goal_id,
        duration: 10,
      }
      goalRequests.push(goals)
    }
    // //console.log('requ', goalRequests)
    // //console.log('all', this.allLpData)

    if (goalRequests.length) {
      this.btnGoalsSvc.createGoals(goalRequests).subscribe(response => {
        for (let i = 0; i < response.length; i += 1) {
          const goalName = this.allLpData.find((lp: ILpData) => {
            return lp.lp_id === linkedId
          })
          if (goalName) {
            if (response[i] === 'invalid.commongoal') {
              // this.loggerSvc.log(goalsData[i], 'failed')
              const res = `${goalName.lp_name} is not launched yet`
              resultLines.push(res)
            } else if (response[i] === 'goal.alreadyexists') {
              const res = `${goalName.lp_name} is already present in your Goals`
              resultLines.push(res)
            } else {
              // this.loggerSvc.log(goalsData[i], 'success')
              const res = `${goalName.lp_name} Added Successfully`
              resultLines.push(res)
            }
          }
        }
        // //console.log('results', resultLines)
        this.snackBar.openFromComponent(MultilineSnackbarComponent, {
          data: resultLines,
        })
        this.goalsAddingInProgess = false
      })
    } else {
      this.goalsAddingInProgess = false
      this.snackBar.open('Goal not launched yet')
    }
  }

  groupMemberChanged(index: number) {
    // //console.log(index, 'select radio ')
    this.selectedMemberList = []
    this.groupMemberIndex = index
    if (this.selectedVariant) {
      if (this.certificationsResolverData.widgetData && this.certificationsResolverData.widgetData.strips[0].request) {
        this.certificationsResolverData.widgetData.strips[0].request.ids = []
      }
      this.getCertificationsData(this.selectedVariant)
    }
  }

  getCertificationsData(selectedVariant: IVariant) {
    // //console.log('variant under certification', selectedVariant)
    if (selectedVariant && selectedVariant.group) {
      selectedVariant.group.forEach(group => {
        if (group.group_member.length > 1) {
          // //console.log('Group check', group.group_member)
          // //console.log('Group linked id', group.group_member[this.groupMemberIndex].lp_linked_id)
          this.navSvc
            .fetchLearningPathIdData(String(group.group_member[this.groupMemberIndex].lp_linked_id))
            .subscribe((data: ILpData) => {
              // //console.log('data fetch multiple ', data)
              this.selectedMemberList.push(data.lp_name)
              this.getCertificationsForGM(data)
              this.strips = []
              this.getAlternativeCertificationsForGM(data)
            })
        } else {
          this.navSvc
            .fetchLearningPathIdData(String(group.group_member[0].lp_linked_id))
            .subscribe((data: ILpData) => {
              // //console.log('data fetch id ', data)
              this.selectedMemberList.push(data.lp_name)
              this.getCertificationsForGM(data)
              this.strips = []
              this.getAlternativeCertificationsForGM(data)
            })
        }
      })
    }
  }

  getCertificationsForGM(data: ILpData) {

    let ids: string[] = []
    data.certification_data.forEach((certification: ILpCertification) => {
      ids.push(certification.primary_certificationId)
    })
    this.certificationsResolverData.widgetData.strips.forEach(strip => {
      if (strip.key === 'certifications-strip' && strip.request && strip.request.ids) {
        ids = [...strip.request.ids, ...ids]
        const setIds = new Set(ids)
        strip.request.ids = Array.from(setIds)
      }
    })
    if (this.certificationsResolverData.widgetData.strips[0]) {
      // tslint:disable-next-line: max-line-length
      if (this.certificationsResolverData.widgetData.strips[0].request && this.certificationsResolverData.widgetData.strips[0].request.ids) {
        if (this.certificationsResolverData.widgetData.strips[0].request.ids.length > 0) {
          this.hasCertifications = true
        }
      }
    } else {
      this.hasCertifications = false
    }
    this.certificationsResolverData = { ...this.certificationsResolverData }
  }

  displayAlternatives() {
    this.showAlternatives = !this.showAlternatives
  }

  getAlternativeCertificationsForGM(data: ILpData) {
    data.certification_data.forEach((certification: ILpCertification) => {
      const certID = [certification.primary_certificationId]
      const alternateIds = certification.alternate_certificationId

      if (alternateIds.length > 0) {

        this.contentSvc.fetchMultipleContent(certID).subscribe(
          (result: NsContent.IContent[]) => {
            const stripData = {
              key: `alternate-strip${certID}`,
              preWidgets: [],
              title: `Alternate Certification for ${result[0].name}`,
              filters: [],
              request: {
                ids: alternateIds,
              },
            }
            this.strips.push(stripData)

          },
          () => {

          },
          () => {
            this.alternateCertificationsResolverData.widgetData.strips = this.strips

            this.alternateCertificationsResolverData = { ...this.alternateCertificationsResolverData }
            if (this.alternateCertificationsResolverData.widgetData.strips.length > 0) {
              this.hasAlternatives = true
            } else {
              this.hasAlternatives = false
            }
          })
      } else { }
    })
  }
}
