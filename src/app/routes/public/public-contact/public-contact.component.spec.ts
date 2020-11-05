import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PublicContactComponent } from './public-contact.component'

describe('PublicContactComponent', () => {
  let component: PublicContactComponent
  let fixture: ComponentFixture<PublicContactComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PublicContactComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicContactComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
