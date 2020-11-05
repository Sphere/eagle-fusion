import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { IapCardComponent } from './iap-card.component'

describe('IapCardComponent', () => {
  let component: IapCardComponent
  let fixture: ComponentFixture<IapCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IapCardComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(IapCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
