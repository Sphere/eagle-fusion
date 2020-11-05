import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ContentStripInputComponent } from './content-strip-input.component'

describe('ContentStripInputComponent', () => {
  let component: ContentStripInputComponent
  let fixture: ComponentFixture<ContentStripInputComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContentStripInputComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentStripInputComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
