import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ApiRequestComponent } from './api-request.component'

describe('ApiRequestComponent', () => {
  let component: ApiRequestComponent
  let fixture: ComponentFixture<ApiRequestComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApiRequestComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiRequestComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
