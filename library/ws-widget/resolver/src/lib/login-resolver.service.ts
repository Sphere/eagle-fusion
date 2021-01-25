import { WIDGET_RESOLVER_GLOBAL_CONFIG, WIDGET_RESOLVER_SCOPED_CONFIG } from './widget-resolver.constant'
import {
  Injectable,
  Inject,
  ComponentFactoryResolver,
  ViewContainerRef,
  ComponentRef,
  Type,
} from '@angular/core'
import { NsWidgetResolver } from '../public-api'
import { DomSanitizer } from '@angular/platform-browser'
import { InvalidRegistrationComponent } from './invalid-registration/invalid-registration.component'
import { InvalidPermissionComponent } from './invalid-permission/invalid-permission.component'
import { UnresolvedComponent } from './unresolved/unresolved.component'

@Injectable({
  providedIn: 'root',
})
export class LoginResolverService {
  isInitialized = false

  constructor(
    private domSanitizer: DomSanitizer,
    private componentFactoryResolver: ComponentFactoryResolver,
    @Inject(WIDGET_RESOLVER_GLOBAL_CONFIG)
    private globalConfig: null | NsWidgetResolver.IRegistrationConfig[],
    @Inject(WIDGET_RESOLVER_SCOPED_CONFIG)
    private scopedConfig: null | NsWidgetResolver.IRegistrationConfig[]) { }
  private availableRegisteredWidgets: Map<
    string,
    NsWidgetResolver.IRegistrationConfig
  > | null = null
  static getWidgetKey(config: NsWidgetResolver.IBaseConfig) {
    return `widget:${config.widgetType}::${config.widgetSubType}`
  }

  initialize() {
    const registrationConfig: Map<string, NsWidgetResolver.IRegistrationConfig> = new Map()
    const allWidgetsConfigurations: NsWidgetResolver.IRegistrationConfig[] = []
    if (this.globalConfig && Array.isArray(this.globalConfig)) {
      allWidgetsConfigurations.push(...this.globalConfig)
    }
    if (this.scopedConfig && Array.isArray(this.scopedConfig)) {
      allWidgetsConfigurations.push(...this.scopedConfig)
    }
    this.availableRegisteredWidgets = registrationConfig
    this.isInitialized = true
  }

  loginResolveWidget(
    receivedConfig: NsWidgetResolver.IRenderConfigWithAnyData,
    containerRef: ViewContainerRef,
  ): ComponentRef<any> | null {
    const key = LoginResolverService.getWidgetKey(receivedConfig)
    const registrationConfig: Map<string, NsWidgetResolver.IRegistrationConfig> = new Map()
    const allWidgetsConfigurations: NsWidgetResolver.IRegistrationConfig[] = []
    if ((key === 'widget:layout::gridLayout' || key === 'widget:layout::linearLayout') &&
      this.availableRegisteredWidgets && this.availableRegisteredWidgets.size === 0) {

      if (this.globalConfig && Array.isArray(this.globalConfig)) {
        allWidgetsConfigurations.push(...this.globalConfig)
        allWidgetsConfigurations.forEach(u => {
          const k = LoginResolverService.getWidgetKey(u)
          if (k === 'widget:layout::gridLayout' || k === 'widget:layout::linearLayout' || k === 'widget:slider::sliderBanners'
            || k === 'widget:contentStrip::contentStripMultiple' || k === 'widget:card::cardContent'
            || k === 'widget:actionButton::actionButtonCatalog'
            || k === 'widget:tree::treeCatalog' ||
            k === 'widget:actionButton::buttonFeature' || k === 'widget:card::cardBreadcrumb') {
            registrationConfig.set(k, u)
          }
        })
        this.availableRegisteredWidgets = registrationConfig
      }
    }

    if (this.availableRegisteredWidgets && this.availableRegisteredWidgets.has(key)) {
      const config = this.availableRegisteredWidgets.get(key)
      if (config && config.component) {
        return this.widgetResolved(containerRef, receivedConfig, config.component)
      }
      // Not properly registered
      return this.widgetResolved(containerRef, receivedConfig, InvalidRegistrationComponent)
      // }
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
    const factory = this.componentFactoryResolver.resolveComponentFactory(component)
    containerRef.clear()
    const compRef: ComponentRef<NsWidgetResolver.IWidgetData<any>> = containerRef.createComponent(
      factory,
    )
    compRef.instance.widgetData = compData.widgetData
    if (compRef.instance.updateBaseComponent) {
      const widgetSafeStyle = compData.widgetHostStyle
        ? this.domSanitizer.bypassSecurityTrustStyle(
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
