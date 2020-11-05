import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { KhubHomeComponent } from './khub-home.component'

describe('KhubHomeComponent', () => {
  let component: KhubHomeComponent
  let fixture: ComponentFixture<KhubHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KhubHomeComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(KhubHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
