import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AppCallBackComponent } from './app-call-back.component'

describe('AppCallBackComponent', () => {
  let component: AppCallBackComponent
  let fixture: ComponentFixture<AppCallBackComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppCallBackComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppCallBackComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
