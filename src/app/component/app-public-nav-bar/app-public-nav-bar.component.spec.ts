import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AppPublicNavBarComponent } from './app-public-nav-bar.component'

describe('AppPublicNavBarComponent', () => {
  let component: AppPublicNavBarComponent
  let fixture: ComponentFixture<AppPublicNavBarComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppPublicNavBarComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppPublicNavBarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
