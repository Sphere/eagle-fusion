import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { NavigatorCardComponent } from './navigator-card.component'

describe('NavigatorCardComponent', () => {
  let component: NavigatorCardComponent
  let fixture: ComponentFixture<NavigatorCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NavigatorCardComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigatorCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
