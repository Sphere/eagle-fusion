import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DialogSocialActivityUserComponent } from './dialog-social-activity-user.component'

describe('DialogSocialActivityUserComponent', () => {
  let component: DialogSocialActivityUserComponent
  let fixture: ComponentFixture<DialogSocialActivityUserComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DialogSocialActivityUserComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogSocialActivityUserComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
