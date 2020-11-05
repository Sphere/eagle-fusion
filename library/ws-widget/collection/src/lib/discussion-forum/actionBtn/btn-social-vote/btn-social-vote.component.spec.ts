import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnSocialVoteComponent } from './btn-social-vote.component'

describe('BtnSocialVoteComponent', () => {
  let component: BtnSocialVoteComponent
  let fixture: ComponentFixture<BtnSocialVoteComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnSocialVoteComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnSocialVoteComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
