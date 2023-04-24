import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SashaktCallbackComponent } from './sashakt-callback.component'

describe('SashaktCallbackComponent', () => {
  let component: SashaktCallbackComponent
  let fixture: ComponentFixture<SashaktCallbackComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SashaktCallbackComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SashaktCallbackComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
