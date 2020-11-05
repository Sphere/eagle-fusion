import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PickerContentComponent } from './picker-content.component'

describe('PickerContentComponent', () => {
  let component: PickerContentComponent
  let fixture: ComponentFixture<PickerContentComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PickerContentComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PickerContentComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
