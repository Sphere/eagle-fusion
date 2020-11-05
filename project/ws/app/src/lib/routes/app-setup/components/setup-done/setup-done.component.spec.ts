import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SetupDoneComponent } from './setup-done.component'

describe('SetupDoneComponent', () => {
  let component: SetupDoneComponent
  let fixture: ComponentFixture<SetupDoneComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SetupDoneComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupDoneComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
