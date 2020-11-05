import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ViewFollowpersonComponent } from './view-followperson.component'

describe('ViewFollowpersonComponent', () => {
  let component: ViewFollowpersonComponent
  let fixture: ComponentFixture<ViewFollowpersonComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewFollowpersonComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewFollowpersonComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
