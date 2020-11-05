import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnSocialLikeComponent } from './btn-social-like.component'

describe('BtnSocialLikeComponent', () => {
  let component: BtnSocialLikeComponent
  let fixture: ComponentFixture<BtnSocialLikeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnSocialLikeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnSocialLikeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
