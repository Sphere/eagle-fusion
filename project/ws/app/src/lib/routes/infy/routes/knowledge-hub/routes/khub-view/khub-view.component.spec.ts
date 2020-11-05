import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { KhubViewComponent } from './khub-view.component'

describe('KhubViewComponent', () => {
  let component: KhubViewComponent
  let fixture: ComponentFixture<KhubViewComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KhubViewComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(KhubViewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
