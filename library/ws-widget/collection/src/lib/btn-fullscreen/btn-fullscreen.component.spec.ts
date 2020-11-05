import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnFullscreenComponent } from './btn-fullscreen.component'

describe('BtnFullscreenComponent', () => {
  let component: BtnFullscreenComponent
  let fixture: ComponentFixture<BtnFullscreenComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnFullscreenComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnFullscreenComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
