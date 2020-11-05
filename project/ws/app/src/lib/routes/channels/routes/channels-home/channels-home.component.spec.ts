import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ChannelsHomeComponent } from './channels-home.component'

describe('ChannelsHomeComponent', () => {
  let component: ChannelsHomeComponent
  let fixture: ComponentFixture<ChannelsHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelsHomeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelsHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
