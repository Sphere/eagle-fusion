import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ContentProgressComponent } from './content-progress.component'

describe('ContentProgressComponent', () => {
  let component: ContentProgressComponent
  let fixture: ComponentFixture<ContentProgressComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContentProgressComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentProgressComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
