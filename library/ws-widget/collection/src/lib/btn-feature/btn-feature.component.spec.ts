import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnFeatureComponent } from './btn-feature.component'

describe('BtnFeatureComponent', () => {
  let component: BtnFeatureComponent
  let fixture: ComponentFixture<BtnFeatureComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnFeatureComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnFeatureComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
