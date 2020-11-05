import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnFlagComponent } from './btn-flag.component'

describe('BtnFlagComponent', () => {
  let component: BtnFlagComponent
  let fixture: ComponentFixture<BtnFlagComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnFlagComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnFlagComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
