import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ChannelHubsComponent } from './channel-hubs.component'

describe('ChannelHubsComponent', () => {
  let component: ChannelHubsComponent
  let fixture: ComponentFixture<ChannelHubsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelHubsComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelHubsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
