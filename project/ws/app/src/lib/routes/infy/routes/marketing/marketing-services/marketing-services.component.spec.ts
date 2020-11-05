import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { MarketingServicesComponent } from './marketing-services.component'

describe('MarketingServicesComponent', () => {
  let component: MarketingServicesComponent
  let fixture: ComponentFixture<MarketingServicesComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MarketingServicesComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketingServicesComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
