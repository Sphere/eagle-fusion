import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DialogBoxModeratorComponent } from './dialog-box-moderator.component'

describe('DialogBoxModeratorComponent', () => {
  let component: DialogBoxModeratorComponent
  let fixture: ComponentFixture<DialogBoxModeratorComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DialogBoxModeratorComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogBoxModeratorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
