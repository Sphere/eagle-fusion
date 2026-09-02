import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TncRendererComponent } from './tnc-renderer.component'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { of } from 'rxjs'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core' // Import CUSTOM_ELEMENTS_SCHEMA
import { MatIconModule } from '@angular/material/icon' // Import MatIconModule
import { MatMenuModule } from '@angular/material/menu' // Import MatMenuModule
import { HttpClientTestingModule } from '@angular/common/http/testing' // Import HttpClientTestingModule
import { SafeResourceUrlService } from '../../../../library/ws-widget/utils/src/lib/services/safe-resource-url.service'

describe('TncRendererComponent', () => {
  let component: TncRendererComponent
  let fixture: ComponentFixture<TncRendererComponent>
  const mockSafeResourceUrlSvc = { trustHtml: jest.fn().mockImplementation(value => ({ trusted: value })) }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TncRendererComponent],
      imports: [MatIconModule, MatMenuModule, HttpClientTestingModule], // Import MatIconModule, MatMenuModule, HttpClientTestingModule
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
          },
        },
        ConfigurationsService,
        { provide: SafeResourceUrlService, useValue: mockSafeResourceUrlSvc },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA], // Add CUSTOM_ELEMENTS_SCHEMA to suppress unknown element errors
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(TncRendererComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should emit the selected locale when changeTncLang is called', () => {
    const locale = 'en'
    jest.spyOn(component.tncChange, 'emit')
    component.changeTncLang(locale)
    expect(component.tncChange.emit).toHaveBeenCalledWith(locale)
  })

  it('should emit the selected locale when changeDpLang is called', () => {
    const locale = 'en'
    jest.spyOn(component.dpChange, 'emit')
    component.changeDpLang(locale)
    expect(component.dpChange.emit).toHaveBeenCalledWith(locale)
  })

  it('should emit an event when backBtnClick is called', () => {
    jest.spyOn(component.backBtn, 'emit')
    component.backBtnClick()
    expect(component.backBtn.emit).toHaveBeenCalled()
  })

  it('should set generalTnc and dpTnc from tncData in ngOnChanges', () => {
    component.tncData = {
      isAccepted: false,
      termsAndConditions: [
        { name: 'Generic T&C', language: 'en', version: '1.0', isAccepted: false, url: '' },
        { name: 'Data Privacy', language: 'en', version: '1.0', isAccepted: false, url: '' },
      ],
    } as any
    component.ngOnChanges()
    expect(component.generalTnc).not.toBeNull()
    expect(component.generalTnc?.name).toBe('Generic T&C')
    expect(component.dpTnc).not.toBeNull()
    expect(component.dpTnc?.name).toBe('Data Privacy')
  })

  it('should assign generalTnc and dpTnc in ngOnInit when tncData is set', () => {
    component.tncData = {
      isAccepted: false,
      termsAndConditions: [
        { name: 'Generic T&C', language: 'hi', version: '2.0', isAccepted: false, url: '' },
        { name: 'Data Privacy', language: 'hi', version: '2.0', isAccepted: false, url: '' },
      ],
    } as any
    component.ngOnInit()
    expect(component.generalTnc?.language).toBe('hi')
  })

  it('should default currentPanel to tnc', () => {
    expect(component.currentPanel).toBe('tnc')
  })

  it('should not assign when tncData is null in ngOnChanges', () => {
    component.tncData = null
    component.generalTnc = null
    component.ngOnChanges()
    expect(component.generalTnc).toBeNull()
  })

  it('reCenterPanel should not throw when element is not found', () => {
    jest.spyOn(document, 'getElementById').mockReturnValue(null)
    expect(() => component.reCenterPanel()).not.toThrow()
    jest.restoreAllMocks()
  })

  it('reCenterPanel should call scrollIntoView when element is found', () => {
    const mockEl = { scrollIntoView: jest.fn() }
    jest.spyOn(document, 'getElementById').mockReturnValue(mockEl as any)
    component.reCenterPanel()
    expect(mockEl.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    jest.restoreAllMocks()
  })

  describe('constructor restrictedFeatures branch', () => {
    const makeCmp = (config: any, route: any) =>
      new TncRendererComponent(config, route, { markForCheck: jest.fn() } as any, mockSafeResourceUrlSvc as any)

    it('should set termsOfUser false when restrictedFeatures has termsOfUser', () => {
      const cmp = makeCmp({ restrictedFeatures: new Set(['termsOfUser']) }, { queryParams: of({}) })
      expect(cmp.termsOfUser).toBe(false)
    })

    it('should keep termsOfUser true when restrictedFeatures lacks termsOfUser', () => {
      const cmp = makeCmp({ restrictedFeatures: new Set(['other']) }, { queryParams: of({}) })
      expect(cmp.termsOfUser).toBe(true)
    })

    it('should keep termsOfUser true when restrictedFeatures is undefined', () => {
      const cmp = makeCmp({}, { queryParams: of({}) })
      expect(cmp.termsOfUser).toBe(true)
    })
  })

  describe('ngOnInit query param panel switching', () => {
    const tncData = {
      isAccepted: false,
      termsAndConditions: [
        { name: 'Generic T&C', language: 'en', version: '1.0', isAccepted: false, url: '' },
        { name: 'Data Privacy', language: 'en', version: '1.0', isAccepted: false, url: '' },
      ],
    } as any

    it('should set currentPanel to dp when panel=dp and dpTnc not accepted', () => {
      const cmp = new TncRendererComponent({}, { queryParams: of({ panel: 'dp' }) } as any, { markForCheck: jest.fn() } as any, mockSafeResourceUrlSvc as any)
      cmp.tncData = tncData
      cmp.ngOnInit()
      expect(cmp.currentPanel).toBe('dp')
    })

    it('should set currentPanel to tnc when panel=tnc and generalTnc not accepted', () => {
      const cmp = new TncRendererComponent({}, { queryParams: of({ panel: 'tnc' }) } as any, { markForCheck: jest.fn() } as any, mockSafeResourceUrlSvc as any)
      cmp.currentPanel = 'dp'
      cmp.tncData = tncData
      cmp.ngOnInit()
      expect(cmp.currentPanel).toBe('tnc')
    })

    it('should not switch panel when tncData already accepted', () => {
      const accepted = { ...tncData, isAccepted: true }
      const cmp = new TncRendererComponent({}, { queryParams: of({ panel: 'dp' }) } as any, { markForCheck: jest.fn() } as any, mockSafeResourceUrlSvc as any)
      cmp.tncData = accepted
      cmp.ngOnInit()
      expect(cmp.currentPanel).toBe('tnc')
    })
  })
})
