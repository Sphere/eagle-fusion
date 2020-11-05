import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LastUpdateDisplayComponent } from './last-update-display.component'

describe('LastUpdateDisplayComponent', () => {
  let component: LastUpdateDisplayComponent
  let fixture: ComponentFixture<LastUpdateDisplayComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LastUpdateDisplayComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LastUpdateDisplayComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
