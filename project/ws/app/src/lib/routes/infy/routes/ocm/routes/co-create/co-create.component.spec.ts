import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CoCreateComponent } from './co-create.component'

describe('CoCreateComponent', () => {
  let component: CoCreateComponent
  let fixture: ComponentFixture<CoCreateComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CoCreateComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CoCreateComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
