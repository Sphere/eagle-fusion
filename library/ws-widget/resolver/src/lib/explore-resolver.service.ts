import { WIDGET_RESOLVER_GLOBAL_CONFIG, WIDGET_RESOLVER_SCOPED_CONFIG } from './widget-resolver.constant'
import {
  Injectable,
  Inject,
  ViewContainerRef,
  ComponentRef,
  Type,
} from '@angular/core'
import { NsWidgetResolver } from '../lib/widget-resolver.model'
import { SafeResourceUrlService } from '@ws-widget/utils'
import { InvalidRegistrationComponent } from './invalid-registration/invalid-registration.component'
import { UnresolvedComponent } from './unresolved/unresolved.component'

@Injectable({
  providedIn: 'root',
})
export class ExploreResolverService {

  isInitialized = false
  private availableRegisteredWidgets: Map<string, NsWidgetResolver.IRegistrationConfig> | null = null

  constructor(
    private safeResourceUrlSvc: SafeResourceUrlService,
    @Inject(WIDGET_RESOLVER_GLOBAL_CONFIG)
    private globalConfig: null | NsWidgetResolver.IRegistrationConfig[],
    @Inject(WIDGET_RESOLVER_SCOPED_CONFIG)
    private scopedConfig: null | NsWidgetResolver.IRegistrationConfig[]) { }
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

  exploreResolveWidget(
    receivedConfig: NsWidgetResolver.IRenderConfigWithAnyData,
    containerRef: ViewContainerRef,
  ): ComponentRef<any> | null {
    const key = ExploreResolverService.getWidgetKey(receivedConfig)
    const registrationConfig: Map<string, NsWidgetResolver.IRegistrationConfig> = new Map()
    const allWidgetsConfigurations: NsWidgetResolver.IRegistrationConfig[] = []
    if (this.availableRegisteredWidgets && this.availableRegisteredWidgets.size === 0) {

      if (this.globalConfig && Array.isArray(this.globalConfig)) {
        allWidgetsConfigurations.push(...this.globalConfig)
        allWidgetsConfigurations.forEach(u => {
          const k = ExploreResolverService.getWidgetKey(u)
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
