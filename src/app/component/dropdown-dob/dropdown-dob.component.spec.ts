import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DropdownDobComponent } from './dropdown-dob.component'

describe('DropdownDobComponent', () => {
  let component: DropdownDobComponent
  let fixture: ComponentFixture<DropdownDobComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DropdownDobComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownDobComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
