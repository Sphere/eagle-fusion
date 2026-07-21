import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { ActivatedRoute, Data, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { NsTnc } from '../../models/tnc.model'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ROOT_WIDGET_CONFIG, NsError } from '@ws-widget/collection'
import { TncAppResolverService } from '../../services/tnc-app-resolver.service'
import { TncPublicResolverService } from '../../services/tnc-public-resolver.service'
import { UntypedFormGroup } from '@angular/forms'
import {
  ConfigurationsService,
  LoggerService,
} from '@ws-widget/utils'
import { SignupService } from '../signup/signup.service'
@Component({
  standalone: false,
  selector: 'ws-tnc',
  templateUrl: './tnc.component.html',
  styleUrls: ['./tnc.component.scss'],

})
export class TncComponent implements OnInit, OnDestroy {
  tncData: NsTnc.ITnc | null = null
  routeSubscription: Subscription | null = null
  result: any
  tncFlag = false
  isAcceptInProgress = false
  errorInAccepting = false
  isPublic = false
  userId = false
  createUserForm!: UntypedFormGroup
  errorWidget: NsWidgetResolver.IRenderConfigWithTypedData<NsError.IWidgetErrorResolver> = {
    widgetType: ROOT_WIDGET_CONFIG.errorResolver._type,
    widgetSubType: ROOT_WIDGET_CONFIG.errorResolver.errorResolver,
    widgetData: {
      errorType: 'internalServer',
    },
  }
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly tncProtectedSvc: TncAppResolverService,
    private readonly tncPublicSvc: TncPublicResolverService,
    public configSvc: ConfigurationsService,
    private readonly signupService: SignupService,
    private readonly logger: LoggerService,
    private readonly cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.initializeTnc()
  }

  private initializeTnc(): void {
    this.logger.log(this.configSvc)
    this.signupService.fetchStartUpDetails().then(result => {
      this.result = result
      this.logger.log(this.result)
    }).catch(err => {
      this.logger.error('Error fetching startup details:', err)
    })
    this.routeSubscription = this.activatedRoute.data.subscribe((response: Data) => {
      if (response.tnc.data) {
        this.tncData = response.tnc.data
        // this.configSvc.isNewUser = Boolean(this.tncData && this.tncData.isNewUser)
        this.isPublic = response.isPublic || false
        this.cdr.markForCheck()
      } else {
        this.router.navigate(['error-service-unavailable'])
        // this.errorFetchingTnc = true
      }
    })
    if (this.configSvc.unMappedUser && this.configSvc.unMappedUser!.profileDetails) {
      this.userId = true
    } else {
      this.userId = false
    }
    // this.createUserForm = this.createTncFormFields()
  }
  homePage() {
    this.logger.log(this.configSvc)
  }
  // createTncFormFields() {
  //   return new FormGroup({
  //     tncAccepted: new FormControl(''),
  //     firstname: new FormControl('', []),
  //     middlename: new FormControl('', []),
  //     surname: new FormControl('', []),
  //     mobile: new FormControl('', []),
  //     telephone: new FormControl('', []),
  //     primaryEmail: new FormControl('', []),
  //     primaryEmailType: new FormControl('', []),
  //     dob: new FormControl('', []),
  //   })
  // }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe()
    }
  }

  getTnc(locale: string) {
    let dpData: NsTnc.ITncUnit
    if (this.tncData) {
      dpData = this.tncData.termsAndConditions.filter(term => term.name === 'Data Privacy')[0]
      const tncTerm = this.tncData.termsAndConditions.filter(term => term.name === 'Generic T&C')[0]
      if (locale === tncTerm.language) {
        return
      }
      if (this.isPublic) {
        this.tncPublicSvc.getPublicTnc().subscribe(data => {
          this.assignTncData(dpData, data)
        })
      } else {
        this.tncProtectedSvc.getTnc(locale).subscribe(data => {
          this.assignTncData(dpData, data)
        })
      }
    }
  }
  private assignTncData(dpData: NsTnc.ITncUnit, data: NsTnc.ITnc) {
    data.termsAndConditions[1] = { ...dpData }
    if (this.tncData) {
      this.tncData = {
        ...data,
      }
    }
  }

  getDp(locale: string) {
    let tncData: NsTnc.ITncUnit
    if (this.tncData) {
      tncData = this.tncData.termsAndConditions.filter(term => term.name === 'Generic T&C')[0]
      const dpTerm = this.tncData.termsAndConditions.filter(term => term.name === 'Data Privacy')[0]
      if (locale === dpTerm.language) {
        return
      }
      if (this.isPublic) {
        this.tncPublicSvc.getPublicTnc().subscribe(data => {
          this.assignDp(tncData, data)
        })
      } else {
        this.tncProtectedSvc.getTnc(locale).subscribe(data => {
          this.assignDp(tncData, data)
        })
      }
    }
  }
  assignDp(tncData: NsTnc.ITncUnit, data: NsTnc.ITnc) {
    data.termsAndConditions[0] = tncData
    if (this.tncData) {
      this.tncData = {
        ...data,
      }
    }
  }

  backEvent() {
    this.tncData = null
    this.router.navigateByUrl('/page/home')
  }
}
