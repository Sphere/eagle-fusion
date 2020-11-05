import { InjectionToken } from '@angular/core'
import { NsWidgetResolver as resolver } from './widget-resolver.model'

export const WIDGET_RESOLVER_GLOBAL_CONFIG = new InjectionToken<resolver.IRegistrationConfig[]>(
  'Global Registration Configuration for Widget Resolvers',
)

export const WIDGET_RESOLVER_SCOPED_CONFIG = new InjectionToken<resolver.IRegistrationConfig[]>(
  'Scoped Registration Configuration for Widget Resolvers',
)
