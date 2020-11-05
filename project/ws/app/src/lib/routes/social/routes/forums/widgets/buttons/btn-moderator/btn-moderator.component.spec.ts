import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnModeratorComponent } from './btn-moderator.component'

describe('BtnModeratorComponent', () => {
  let component: BtnModeratorComponent
  let fixture: ComponentFixture<BtnModeratorComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnModeratorComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnModeratorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
