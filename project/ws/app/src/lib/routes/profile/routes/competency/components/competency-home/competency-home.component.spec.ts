import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CompetencyHomeComponent } from './competency-home.component'

describe('CompetencyHomeComponent', () => {
  let component: CompetencyHomeComponent
  let fixture: ComponentFixture<CompetencyHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CompetencyHomeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CompetencyHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
