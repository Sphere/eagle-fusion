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
    spyOn(component.tncChange, 'emit')
    component.changeTncLang(locale)
    expect(component.tncChange.emit).toHaveBeenCalledWith(locale)
  })

  it('should emit the selected locale when changeDpLang is called', () => {
    const locale = 'en'
    spyOn(component.dpChange, 'emit')
    component.changeDpLang(locale)
    expect(component.dpChange.emit).toHaveBeenCalledWith(locale)
  })

  it('should emit an event when backBtnClick is called', () => {
    spyOn(component.backBtn, 'emit')
    component.backBtnClick()
    expect(component.backBtn.emit).toHaveBeenCalled()
  })
})
