import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AppNavBarComponent } from './app-nav-bar.component'

describe('AppNavBarComponent', () => {
  let component: AppNavBarComponent
  let fixture: ComponentFixture<AppNavBarComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppNavBarComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppNavBarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
