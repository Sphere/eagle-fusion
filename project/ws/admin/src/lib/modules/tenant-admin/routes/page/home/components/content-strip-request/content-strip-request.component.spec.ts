import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ContentStripRequestComponent } from './content-strip-request.component'

describe('ContentStripRequestComponent', () => {
  let component: ContentStripRequestComponent
  let fixture: ComponentFixture<ContentStripRequestComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContentStripRequestComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentStripRequestComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
