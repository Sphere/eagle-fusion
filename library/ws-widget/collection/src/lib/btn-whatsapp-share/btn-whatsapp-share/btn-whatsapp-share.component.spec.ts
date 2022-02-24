import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnWhatsappShareComponent } from './btn-whatsapp-share.component'

describe('BtnWhatsappShareComponent', () => {
  let component: BtnWhatsappShareComponent
  let fixture: ComponentFixture<BtnWhatsappShareComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnWhatsappShareComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnWhatsappShareComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
