import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CommunicationsComponent } from './communications.component'

describe('CommunicationsComponent', () => {
  let component: CommunicationsComponent
  let fixture: ComponentFixture<CommunicationsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommunicationsComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
