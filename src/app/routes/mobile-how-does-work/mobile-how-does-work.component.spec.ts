import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { MobileHowDoesWorkComponent } from './mobile-how-does-work.component'

describe('MobileHowDoesWorkComponent', () => {
  let component: MobileHowDoesWorkComponent
  let fixture: ComponentFixture<MobileHowDoesWorkComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MobileHowDoesWorkComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileHowDoesWorkComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
