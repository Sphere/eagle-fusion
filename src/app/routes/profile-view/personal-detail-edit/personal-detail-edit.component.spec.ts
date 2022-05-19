import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PersonalDetailEditComponent } from './personal-detail-edit.component'

describe('PersonalDetailEditComponent', () => {
  let component: PersonalDetailEditComponent
  let fixture: ComponentFixture<PersonalDetailEditComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalDetailEditComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalDetailEditComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
