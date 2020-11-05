import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DbmsConceptDropdownComponent } from './dbms-concept-dropdown.component'

describe('DbmsConceptDropdownComponent', () => {
  let component: DbmsConceptDropdownComponent
  let fixture: ComponentFixture<DbmsConceptDropdownComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DbmsConceptDropdownComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DbmsConceptDropdownComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
