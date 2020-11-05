import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { MyRewardsHomeComponent } from './my-rewards-home.component'

describe('MyRewardsHomeComponent', () => {
  let component: MyRewardsHomeComponent
  let fixture: ComponentFixture<MyRewardsHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyRewardsHomeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MyRewardsHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
