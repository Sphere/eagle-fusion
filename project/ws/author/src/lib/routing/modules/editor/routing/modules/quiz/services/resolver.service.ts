import { Injectable } from '@angular/core'

import { NSContent } from '@ws/author/src/lib/interface/content'
import { AccessControlService } from '../../../../../../../modules/shared/services/access-control.service'

@Injectable()
export class QuizResolverService {
  constructor(
    private accessControl: AccessControlService
  ) { }

  canEdit(meta: NSContent.IContentMeta): boolean {
    // reviwer or publisher cannot edit or add or delete
    let returnVal = true
    if (meta.trackContacts && meta.trackContacts.length) {
      meta.trackContacts.forEach(v => {
        if (v.id === this.accessControl.userId) {
          returnVal = false
        }
      })
    }
    if (meta.publisherDetails && meta.publisherDetails.length && meta.status === 'InReview') {
      meta.publisherDetails.forEach(v => {
        if (v.id === this.accessControl.userId) {
          returnVal = false
        }
      })
    }
    if (meta.creatorContacts && meta.creatorContacts.length && meta.status === 'Reviewed') {
      meta.creatorContacts.forEach(v => {
        if (v.id === this.accessControl.userId) {
          returnVal = true
        }
      })
    }
    return returnVal
  }
}
