import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ContentAuthoredComponent } from './content-authored.component'

describe('ContentAuthoredComponent', () => {
  let component: ContentAuthoredComponent
  let fixture: ComponentFixture<ContentAuthoredComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContentAuthoredComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentAuthoredComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
