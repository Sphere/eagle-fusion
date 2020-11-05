import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnProfileComponent } from './btn-profile.component'

describe('BtnProfileComponent', () => {
  let component: BtnProfileComponent
  let fixture: ComponentFixture<BtnProfileComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnProfileComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnProfileComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
