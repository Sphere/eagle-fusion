import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AdoptionDashboardComponent } from './adoption-dashboard.component'

describe('AdoptionDashboardComponent', () => {
  let component: AdoptionDashboardComponent
  let fixture: ComponentFixture<AdoptionDashboardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdoptionDashboardComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AdoptionDashboardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
