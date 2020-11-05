import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ContentStripHolderComponent } from './content-strip-holder.component'

describe('ContentStripHolderComponent', () => {
  let component: ContentStripHolderComponent
  let fixture: ComponentFixture<ContentStripHolderComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContentStripHolderComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentStripHolderComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
