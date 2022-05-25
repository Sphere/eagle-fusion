import { Injectable } from '@angular/core'

import { DiscussUtilsService } from '../service/discuss-utils.service'
import { ConfigurationsService } from '@ws-widget/utils'
// import { DiscussUtilsService } from '../services/discuss-util.service'

@Injectable({ providedIn: 'root' })
export class DiscussConfigResolve {
  constructor(
    private discussUtilitySvc: DiscussUtilsService,
    public configSvc: ConfigurationsService) {
    this.setConfig()

  }
  setConfig() {
    const config = {
      menuOptions: [
        {
          route: 'all-discussions',
          label: 'All discussions',
          enable: true,
        },
        {
          route: 'categories',
          label: 'Categories',
          enable: true,
        },
        {
          route: 'tags',
          label: 'Tags',
          enable: true,
        },
        {
          route: 'my-discussion',
          label: 'Your discussion',
          enable: true,
        },
      ],
      userName: (this.configSvc.nodebbUserProfile && this.configSvc.nodebbUserProfile.username) || '',
      context: {
        id: 1,
      },
      categories: { result: [] },
      routerSlug: '/app',
      headerOptions: false,
      bannerOption: true,
    }

    this.discussUtilitySvc.setDiscussionConfig(config)
    localStorage.setItem('home', JSON.stringify(config))
    return (this.discussUtilitySvc.getDiscussionConfig() ? this.discussUtilitySvc.getDiscussionConfig() : config)
  }

}
