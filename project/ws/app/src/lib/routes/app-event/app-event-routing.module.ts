import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { EventResolverService } from './services/event-resolver.service'

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'meetup',
        children: [
          {
            path: 'nextup',
            resolve: { eventdata: EventResolverService },
            children: [
              {
                path: ':id',
                children: [
                  {
                    pathMatch: 'full',
                    path: '',
                    redirectTo: 'overview',
                  },
                ],
              },
            ],
          },
        ],
      },
    ]),
  ],
  exports: [RouterModule],
})
export class AppEventRoutingModule { }
