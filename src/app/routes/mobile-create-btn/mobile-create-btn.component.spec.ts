import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { MobileCreateBtnComponent } from './mobile-create-btn.component'

describe('MobileCreateBtnComponent', () => {
  let component: MobileCreateBtnComponent
  let fixture: ComponentFixture<MobileCreateBtnComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MobileCreateBtnComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileCreateBtnComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
