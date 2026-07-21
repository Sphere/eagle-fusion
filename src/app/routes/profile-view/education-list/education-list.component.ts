import { ChangeDetectorRef, Component, effect, Input, OnInit } from '@angular/core'
import { ConfigurationsService, ValueService } from '../../../../../library/ws-widget/utils/src/public-api'
import { UserProfileService } from '../../../../../project/ws/app/src/lib/routes/user-profile/services/user-profile.service'
import { get } from 'lodash'
import { WidgetContentService } from '@ws-widget/collection'

@Component({
  standalone: false,
  selector: 'ws-education-list',
  templateUrl: './education-list.component.html',
  styleUrls: ['./education-list.component.scss'],
})
export class EducationListComponent implements OnInit {
  academicsArray: any[] = []
  showbackButton = false
  showLogOutIcon = false
  trigerrNavigation = true
  isEditableForSphere = false
  @Input() isEkshamata = false
  @Input() data: any
  constructor(
    private readonly configSvc: ConfigurationsService,
    private readonly userProfileSvc: UserProfileService,
    private readonly valueSvc: ValueService,
    private readonly contentSvc: WidgetContentService,
    private readonly cdr: ChangeDetectorRef
  ) {
    effect(() => {
      if (this.valueSvc.isMobile()) {
        this.showbackButton = true
        this.showLogOutIcon = false
      } else {
        this.showbackButton = false
        this.showLogOutIcon = false
      }
    })
  }

  ngOnInit() {
    if (this.configSvc.userProfile) {
      sessionStorage.setItem('onListPage', 'true')
      if (sessionStorage.getItem('academic')) {
        sessionStorage.removeItem('academic')
      }
      this.userProfileSvc.getUserdetailsFromRegistry(this.configSvc.unMappedUser.id).subscribe(
        async (data: any) => {
          this.isEditableForSphere = this.data?.isEditable ?? false
          if (data && get(data, 'profileDetails.profileReq.academics')) {
            this.academicsArray = get(data, 'profileDetails.profileReq.academics')
            this.cdr.detectChanges()
          }
          this.cdr.markForCheck()
        })
    }
  }

  get hasValidAcademics(): boolean {
    return this.academicsArray.some(a => a.nameOfInstitute)
  }

  redirectTo(isEdit?: any, academic?: any) {
    const ob = {
      "type": "academic",
      "edit": isEdit,
      'academic': academic,
    }

    if (sessionStorage.getItem('onListPage')) {
      sessionStorage.removeItem('onListPage')
    }
    if (sessionStorage.getItem('academic')) {
      sessionStorage.removeItem('academic')
    }
    sessionStorage.setItem('academic', JSON.stringify(ob))
    this.contentSvc.changeWork(ob)
  }
}
