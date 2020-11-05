import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnCallComponent } from './btn-call.component'

describe('BtnCallComponent', () => {
  let component: BtnCallComponent
  let fixture: ComponentFixture<BtnCallComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnCallComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnCallComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
