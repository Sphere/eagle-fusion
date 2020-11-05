import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ChannelHubComponent } from './channel-hub.component'

describe('ChannelHubComponent', () => {
  let component: ChannelHubComponent
  let fixture: ComponentFixture<ChannelHubComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelHubComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelHubComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
