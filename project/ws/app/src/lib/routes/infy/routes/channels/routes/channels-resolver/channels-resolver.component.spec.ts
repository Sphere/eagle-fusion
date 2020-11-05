import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ChannelsResolverComponent } from './channels-resolver.component'

describe('ChannelsResolverComponent', () => {
  let component: ChannelsResolverComponent
  let fixture: ComponentFixture<ChannelsResolverComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChannelsResolverComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelsResolverComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
