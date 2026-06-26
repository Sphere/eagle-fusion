import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TncRendererComponent } from './tnc-renderer.component'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService } from '../../../../library/ws-widget/utils/src/lib/services/configurations.service'
import { of } from 'rxjs'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core' // Import CUSTOM_ELEMENTS_SCHEMA
import { MatIconModule } from '@angular/material/icon' // Import MatIconModule
import { MatMenuModule } from '@angular/material/menu' // Import MatMenuModule
import { HttpClientTestingModule } from '@angular/common/http/testing' // Import HttpClientTestingModule
import { PipeSafeSanitizerPipe } from '../../../../library/ws-widget/utils/src/lib/pipes/pipe-safe-sanitizer/pipe-safe-sanitizer.pipe'

describe('TncRendererComponent', () => {
  let component: TncRendererComponent
  let fixture: ComponentFixture<TncRendererComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TncRendererComponent, PipeSafeSanitizerPipe], // Declare your custom pipe
      imports: [MatIconModule, MatMenuModule, HttpClientTestingModule], // Import MatIconModule, MatMenuModule, HttpClientTestingModule
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
          },
        },
        ConfigurationsService,
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
})
