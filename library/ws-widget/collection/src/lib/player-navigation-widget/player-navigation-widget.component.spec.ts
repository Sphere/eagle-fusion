import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PlayerNavigationWidgetComponent } from './player-navigation-widget.component'

describe('PlayerNavigationWidgetComponent', () => {
  let component: PlayerNavigationWidgetComponent
  let fixture: ComponentFixture<PlayerNavigationWidgetComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerNavigationWidgetComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(PlayerNavigationWidgetComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  }))

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
