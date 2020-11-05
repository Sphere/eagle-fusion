import { Injectable } from '@angular/core'
import { NSContent } from '../../../interface/content'
import { IConditionsV2 } from '../../../interface/conditions-v2'

@Injectable()
export class ConditionCheckService {
  constructor() {}

  /**
   * @description Function which evaluates the given conditions decides whether the content is eligible or not
   *
   * @param {NSContent.IContentMeta} content Content for which condition needs to be checked
   * @param {IAuthConditions} [conditions] Condition which needs to be evaluated against includes both fit and not not fit
   * @returns {boolean}  True if passed the evaluation
   * @memberof EditorContentService
   */
  checkConditionV2(content: NSContent.IContentMeta, conditions?: IConditionsV2): boolean {
    if (conditions) {
      let returnValue = true
      if (conditions.notFit && conditions.notFit.length) {
        returnValue = !this.checkUniqueCondition(content, conditions.notFit as any)
      }
      if (returnValue && conditions.fit && conditions.fit.length) {
        returnValue = this.checkUniqueCondition(content, conditions.fit as any)
      }
      return returnValue
    }
    return true
  }

  /**
   * @description Invisible function which actually does the work
   *
   * @param {NSContent.IContentMeta} content Content for which condition needs to be checked
   * @param {{ [key in keyof NSContent.IContentMeta]: string[] }[]} conditions Condition which needs to be evaluated against
   * @returns {boolean} True if passed the evaluation
   * @memberof EditorContentService
   */
  checkUniqueCondition(
    content: NSContent.IContentMeta,
    conditions: { [key in keyof NSContent.IContentMeta]: any[] }[],
  ): boolean {
    try {
      if ((conditions as any).includes('*')) {
        return true
      }
      return conditions.some(condition => {
        let isLocalPassed = true
        Object.keys(condition).forEach(meta => {
          if (
            condition[meta as keyof NSContent.IContentMeta].indexOf(
              content[meta as keyof NSContent.IContentMeta],
            ) < 0
          ) {
            isLocalPassed = false
          }
        })
        return isLocalPassed
      })
    } catch (ex) {
      // tslint:disable-next-line: no-console
      // console.log(ex)
      return false
    }
  }
}
