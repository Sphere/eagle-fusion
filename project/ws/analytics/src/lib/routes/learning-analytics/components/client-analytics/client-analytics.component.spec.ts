import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ClientAnalyticsComponent } from './client-analytics.component'

describe('ClientAnalyticsComponent', () => {
  let component: ClientAnalyticsComponent
  let fixture: ComponentFixture<ClientAnalyticsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClientAnalyticsComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientAnalyticsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
