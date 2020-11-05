import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { MyRequestsComponent } from './my-requests.component'

describe('MyRequestsComponent', () => {
  let component: MyRequestsComponent
  let fixture: ComponentFixture<MyRequestsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyRequestsComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MyRequestsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
