import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { YourLocationComponent } from './your-location.component'

describe('YourLocationComponent', () => {
  let component: YourLocationComponent
  let fixture: ComponentFixture<YourLocationComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [YourLocationComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(YourLocationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
