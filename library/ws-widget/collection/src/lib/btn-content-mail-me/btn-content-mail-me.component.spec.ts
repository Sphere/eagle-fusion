import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnContentMailMeComponent } from './btn-content-mail-me.component'

describe('BtnContentMailMeComponent', () => {
  let component: BtnContentMailMeComponent
  let fixture: ComponentFixture<BtnContentMailMeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnContentMailMeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnContentMailMeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
