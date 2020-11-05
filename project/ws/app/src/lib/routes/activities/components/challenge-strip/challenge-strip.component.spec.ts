import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ChallengeStripComponent } from './challenge-strip.component'

describe('ChallengeStripComponent', () => {
  let component: ChallengeStripComponent
  let fixture: ComponentFixture<ChallengeStripComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChallengeStripComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengeStripComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
