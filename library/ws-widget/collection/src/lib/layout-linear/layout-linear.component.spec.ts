import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LayoutLinearComponent } from './layout-linear.component'

describe('LayoutLinearComponent', () => {
  let component: LayoutLinearComponent
  let fixture: ComponentFixture<LayoutLinearComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LayoutLinearComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutLinearComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
