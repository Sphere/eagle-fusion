import {
  Injectable,
  Inject,
  ViewContainerRef,
  ComponentRef,
  Type,
} from '@angular/core'
import {
  WIDGET_RESOLVER_GLOBAL_CONFIG,
  WIDGET_RESOLVER_SCOPED_CONFIG,
} from './widget-resolver.constant'
import { NsWidgetResolver } from './widget-resolver.model'
import { hasPermissions } from './widget-resolver.permissions'
import { RestrictedComponent } from './restricted/restricted.component'
import { InvalidRegistrationComponent } from './invalid-registration/invalid-registration.component'
import { InvalidPermissionComponent } from './invalid-permission/invalid-permission.component'
import { UnresolvedComponent } from './unresolved/unresolved.component'
import { SafeResourceUrlService } from '@ws-widget/utils'

@Injectable({
  providedIn: 'root',
})
export class WidgetResolverService {
  private roles: Set<string> | null = null
  private groups: Set<string> | null = null
  private restrictedFeatures: Set<string> | null = null
  isInitialized = false
  constructor(
    private readonly safeResourceUrlSvc: SafeResourceUrlService,
    @Inject(WIDGET_RESOLVER_GLOBAL_CONFIG)
    private readonly globalConfig: null | NsWidgetResolver.IRegistrationConfig[],
    @Inject(WIDGET_RESOLVER_SCOPED_CONFIG)
    private readonly scopedConfig: null | NsWidgetResolver.IRegistrationConfig[],
  ) { }
  private availableRegisteredWidgets: Map<
    string,
    NsWidgetResolver.IRegistrationConfig
  > | null = null
  private restrictedWidgetKeys: Set<string> | null = null
  static getWidgetKey(config: NsWidgetResolver.IBaseConfig) {
    return `widget:${config.widgetType}::${config.widgetSubType}`
  }

  initialize(
    restrictedWidgetKeys: Set<string> | null,
    roles: Set<string> | null,
    groups: Set<string> | null,
    restrictedFeatures: Set<string> | null,
  ) {
    this.roles = roles

    this.groups = groups
    this.restrictedFeatures = restrictedFeatures
    const restrictedWidgetKeysSet: Set<string> = restrictedWidgetKeys
      ? restrictedWidgetKeys
      : new Set<string>()
    const registrationConfig: Map<string, NsWidgetResolver.IRegistrationConfig> = new Map()
    const allWidgetsConfigurations: NsWidgetResolver.IRegistrationConfig[] = []

    if (this.globalConfig && Array.isArray(this.globalConfig)) {
      allWidgetsConfigurations.push(...this.globalConfig)
    }
    if (this.scopedConfig && Array.isArray(this.scopedConfig)) {
      allWidgetsConfigurations.push(...this.scopedConfig)
    }
    allWidgetsConfigurations.forEach(u => {
      const key = WidgetResolverService.getWidgetKey(u)
      if (!restrictedWidgetKeysSet.has(key)) {
        registrationConfig.set(key, u)
      }
    })
    this.restrictedWidgetKeys = restrictedWidgetKeysSet
    this.availableRegisteredWidgets = registrationConfig

    this.isInitialized = true
    // this.loggerSvc.log(
    //   `Widget Configurations`,
    //   this.globalConfig,
    //   this.scopedConfig,
    //   this.availableRegisteredWidgets,
    // )
  }

  resolveWidget(
    receivedConfig: NsWidgetResolver.IRenderConfigWithAnyData,
    containerRef: ViewContainerRef,
  ): ComponentRef<any> | null {
    const key = WidgetResolverService.getWidgetKey(receivedConfig)
    if (this.restrictedWidgetKeys && this.restrictedWidgetKeys.has(key)) {
      // Restricted
      return this.widgetResolved(containerRef, receivedConfig, RestrictedComponent)
    }
    if (this.availableRegisteredWidgets && this.availableRegisteredWidgets.has(key)) {
      if (
        hasPermissions(
          receivedConfig.widgetPermission,
          this.roles,
          this.groups,
          this.restrictedFeatures,
        )
      ) {
        const config = this.availableRegisteredWidgets.get(key)
        if (config && config.component) {
          return this.widgetResolved(containerRef, receivedConfig, config.component)
        }
        // Not properly registered
        return this.widgetResolved(containerRef, receivedConfig, InvalidRegistrationComponent)
      }
      // No Permission
      return this.widgetResolved(containerRef, receivedConfig, InvalidPermissionComponent)
    }
    // Not Resolved
    return this.widgetResolved(containerRef, receivedConfig, UnresolvedComponent)
  }

  private widgetResolved(
    containerRef: ViewContainerRef,
    compData: NsWidgetResolver.IRenderConfigWithAnyData,
    component: Type<NsWidgetResolver.IWidgetData<any>>,
  ): ComponentRef<NsWidgetResolver.IWidgetData<any>> {
    containerRef.clear()
    const compRef: ComponentRef<NsWidgetResolver.IWidgetData<any>> = containerRef.createComponent(
      component,
    )
    compRef.instance.widgetData = compData.widgetData
    if (compRef.instance.updateBaseComponent) {
      const widgetSafeStyle = compData.widgetHostStyle
        ? this.safeResourceUrlSvc.trustStyle(
          Object.entries(compData.widgetHostStyle).reduce((s, [k, v]) => `${s}${k}:${v};`, ''),
        )
        : undefined
      compRef.instance.updateBaseComponent(
        compData.widgetType,
        compData.widgetSubType,
        compData.widgetInstanceId,
        compData.widgetHostClass,
        widgetSafeStyle,
      )
    }
    return compRef
  }
}
