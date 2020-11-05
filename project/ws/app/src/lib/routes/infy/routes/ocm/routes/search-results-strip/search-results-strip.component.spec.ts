import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SearchResultsStripComponent } from './search-results-strip.component'

describe('SearchResultsStripComponent', () => {
  let component: SearchResultsStripComponent
  let fixture: ComponentFixture<SearchResultsStripComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SearchResultsStripComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultsStripComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
