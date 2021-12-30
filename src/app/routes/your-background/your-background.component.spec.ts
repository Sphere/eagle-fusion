import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { YourBackgroundComponent } from './your-background.component'

describe('YourBackgroundComponent', () => {
  let component: YourBackgroundComponent
  let fixture: ComponentFixture<YourBackgroundComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [YourBackgroundComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(YourBackgroundComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
