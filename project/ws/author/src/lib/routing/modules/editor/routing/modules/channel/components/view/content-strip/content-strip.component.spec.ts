import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ContentStripComponent } from './content-strip.component'

describe('ContentStripComponent', () => {
  let component: ContentStripComponent
  let fixture: ComponentFixture<ContentStripComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContentStripComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentStripComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
