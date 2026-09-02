import { BtnWhatsappShareComponent } from './btn-whatsapp-share.component'

describe('BtnWhatsappShareComponent', () => {
  let component: BtnWhatsappShareComponent
  let configSvc: any

  beforeEach(() => {
    configSvc = { restrictedFeatures: null }
    component = new BtnWhatsappShareComponent(configSvc)
  })

  it('should create with sharing disabled and no url', () => {
    expect(component).toBeTruthy()
    expect(component.url).toBeNull()
    expect(component.isSocialMediaWhatsappShareEnabled).toBe(false)
  })

  it('should enable sharing when the feature is not restricted', () => {
    configSvc.restrictedFeatures = new Set<string>()
    component.ngOnInit()
    expect(component.isSocialMediaWhatsappShareEnabled).toBe(true)
  })

  it('should disable sharing when the feature is restricted', () => {
    configSvc.restrictedFeatures = new Set(['socialMediaWhatsappShare'])
    component.ngOnInit()
    expect(component.isSocialMediaWhatsappShareEnabled).toBe(false)
  })

  it('should leave sharing disabled when no restrictions are resolved', () => {
    component.ngOnInit()
    expect(component.isSocialMediaWhatsappShareEnabled).toBe(false)
  })
})
