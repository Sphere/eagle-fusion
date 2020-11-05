import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TncComponent } from './tnc.component'

describe('TncComponent', () => {
  let component: TncComponent
  let fixture: ComponentFixture<TncComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TncComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TncComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
