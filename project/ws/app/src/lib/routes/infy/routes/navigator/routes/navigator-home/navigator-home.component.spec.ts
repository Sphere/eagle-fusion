import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { NavigatorHomeComponent } from './navigator-home.component'

describe('NavigatorHomeComponent', () => {
  let component: NavigatorHomeComponent
  let fixture: ComponentFixture<NavigatorHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NavigatorHomeComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigatorHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
