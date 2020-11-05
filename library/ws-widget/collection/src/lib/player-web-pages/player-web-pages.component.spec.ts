import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PlayerWebPagesComponent } from './player-web-pages.component'

describe('PlayerWebPagesComponent', () => {
  let component: PlayerWebPagesComponent
  let fixture: ComponentFixture<PlayerWebPagesComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerWebPagesComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerWebPagesComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
