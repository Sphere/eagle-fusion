import { NgModule, ModuleWithProviders } from '@angular/core'
import { CommonModule } from '@angular/common'
import { WidgetResolverDirective } from './widget-resolver.directive'
import { LoginResolverDirective } from './login-resolver.directive'
import { RestrictedComponent } from './restricted/restricted.component'
import { InvalidRegistrationComponent } from './invalid-registration/invalid-registration.component'
import { InvalidPermissionComponent } from './invalid-permission/invalid-permission.component'
import { UnresolvedComponent } from './unresolved/unresolved.component'
import { MatButtonModule, MatIconModule, MatCardModule } from '@angular/material'
import { NsWidgetResolver } from './widget-resolver.model'
import { WidgetResolverService } from './widget-resolver.service'
import { LoginResolverService } from './login-resolver.service'
import {
  WIDGET_RESOLVER_GLOBAL_CONFIG,
  WIDGET_RESOLVER_SCOPED_CONFIG,
} from './widget-resolver.constant'
import { WidgetBaseComponent } from './widget-base.component'
import { ExploreResolverDirective } from './explore-resolver.directive'
@NgModule({
  declarations: [
    WidgetBaseComponent,
    WidgetResolverDirective,
    LoginResolverDirective,
    RestrictedComponent,
    InvalidRegistrationComponent,
    InvalidPermissionComponent,
    UnresolvedComponent,
    ExploreResolverDirective,
  ],
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  exports: [WidgetResolverDirective, WidgetBaseComponent, LoginResolverDirective, ExploreResolverDirective],
  entryComponents: [
    RestrictedComponent,
    InvalidRegistrationComponent,
    InvalidPermissionComponent,
    UnresolvedComponent,
    WidgetBaseComponent,
  ],
})
export class WidgetResolverModule {
  static forRoot(config: NsWidgetResolver.IRegistrationConfig[]): ModuleWithProviders {
    return {
      ngModule: WidgetResolverModule,
      providers: [
        WidgetResolverService, LoginResolverService,
        {
          provide: WIDGET_RESOLVER_GLOBAL_CONFIG,
          useValue: config,
        },
        {
          provide: WIDGET_RESOLVER_SCOPED_CONFIG,
          useValue: [],
        },
      ],
    }
  }
  static forChild(config: NsWidgetResolver.IRegistrationConfig[]): ModuleWithProviders {
    return {
      ngModule: WidgetResolverModule,
      providers: [
        WidgetResolverService, LoginResolverService,
        {
          provide: WIDGET_RESOLVER_SCOPED_CONFIG,
          useValue: config,
        },
      ],
    }
  }
}
