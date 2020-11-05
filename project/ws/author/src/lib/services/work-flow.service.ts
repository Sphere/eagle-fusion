import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'
import { ConditionCheckService } from '@ws/author/src/lib/modules/shared/services/condition-check.service'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { NSContent } from '@ws/author/src/lib/interface/content'
import { Injectable } from '@angular/core'
import { ISearchContent } from '../interface/search'

@Injectable()
export class WorkFlowService {
  constructor(
    private initService: AuthInitService,
    private conditionService: ConditionCheckService,
    private accessControlSvc: AccessControlService,
  ) {}

  getWorkFlow(content: NSContent.IContentMeta | ISearchContent): string[] {
    // tslint:disable-next-line: no-non-null-assertion
    return this.initService.workFlowTable.find(v =>
      this.conditionService.checkConditionV2(content as any, v.conditions),
    )!.workFlow
  }

  getNextStatus(content: NSContent.IContentMeta | ISearchContent): string {
    const workFlow = this.getWorkFlow(content)
    if (workFlow.length > 3) {
      let index = workFlow.indexOf(content.status)
      if (!this.isOptimised(content)) {
        return workFlow[index + 1]
      }
      if (index === 0 || index === workFlow.length - 1) {
        index = 1
      } else {
        index += 1
      }
      const userId = this.accessControlSvc.userId
      let canStop = false
      while (!canStop && index < workFlow.length - 1) {
        const owner = this.getOwner(workFlow[index])
        if (owner && ((content as any)[owner] || []).find((v: { id: string }) => v.id === userId)) {
          index += 1
        } else {
          canStop = true
        }
      }
      return workFlow[index]
    }
    return 'Live'
  }

  isOptimised(content: NSContent.IContentMeta | ISearchContent): boolean {
    return (
      this.initService.optimizedWorkFlow.allow &&
      this.conditionService.checkConditionV2(
        content as any,
        this.initService.optimizedWorkFlow.conditions,
      )
    )
  }

  getOwner(status: string): string | null {
    // tslint:disable-next-line: no-non-null-assertion
    return this.initService.ownerDetails.find(v => v.status.includes(status))!.owner
  }

  getActionName(status: string): string | null {
    // tslint:disable-next-line: no-non-null-assertion
    return this.initService.ownerDetails.find(v => v.status.includes(status))!.actionName
  }

  getOwnerName(status: string): string | null {
    // tslint:disable-next-line: no-non-null-assertion
    return this.initService.ownerDetails.find(v => v.status.includes(status))!.name
  }
}
