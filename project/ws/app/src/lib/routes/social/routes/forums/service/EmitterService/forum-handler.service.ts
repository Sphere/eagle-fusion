import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { SocialForum } from '../../models/SocialForumposts.model'

@Injectable()
export class ForumHandlerService {
  // new Approach to trigger functions in Mypost
  // invokeFirstComponentFunction = new EventEmitter();
  // subsVar: Subscription = new Subscription
  // onFirstComponentButtonClick() {
  //   this.invokeFirstComponentFunction.emit()
  // }
  constructor() { }

  dataStr = new BehaviorSubject<any[]>([])
  reasonOfRejection = ''
  reasonoOfFlagging = ''
  filterStatus = false
  filterStatusDataReceived = false
  predefinedFiltersExist = false
  predefinedFilterSelected = new BehaviorSubject(SocialForum.ETimelineType.ALL)
  predefinedAdminFilterSelected = new BehaviorSubject<SocialForum.EPostKind[]>([])
  componentActive = new BehaviorSubject('')
  sendPredefinedAdminFilterSelected(adminFilter: SocialForum.EPostKind[]) {
    this.predefinedAdminFilterSelected.next(adminFilter)
  }

  sendFilterStatus(status: boolean) {
    // console.log("The Filter status Received from child component is" + status)
    this.filterStatusDataReceived = true
    this.filterStatus = status
  }
  sendMessage(data: any[]) {
    this.dataStr.next(data)
  }

  // functions for communicating from dialog box to moderator timeline

  sendReasonOfFlagging(reason: string) {
    this.reasonoOfFlagging = reason
    // console.log('The reason for FLAGGINg received in service class is' + this.reason_of_flagging)
  }
  sendStatusOfPredefinedFilter(data: boolean) {
    this.predefinedFiltersExist = data
  }
  sendPredinedFilterSelected(data: SocialForum.ETimelineType) {
    this.predefinedFilterSelected.next(data)
  }
  setActiveComponent(data: string) {
    this.componentActive.next(data)
  }

}
