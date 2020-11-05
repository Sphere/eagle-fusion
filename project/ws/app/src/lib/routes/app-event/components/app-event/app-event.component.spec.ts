import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AppEventComponent } from './app-event.component'

describe('AppEventComponent', () => {
  let component: AppEventComponent
  let fixture: ComponentFixture<AppEventComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppEventComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppEventComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
