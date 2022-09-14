import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { GoogleCallbackComponent } from './google-callback.component'

describe('GoogleCallbackComponent', () => {
  let component: GoogleCallbackComponent
  let fixture: ComponentFixture<GoogleCallbackComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GoogleCallbackComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(GoogleCallbackComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
