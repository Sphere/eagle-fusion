import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SearchFilterDisplayComponent } from './search-filter-display.component'

describe('SearchFilterDisplayComponent', () => {
  let component: SearchFilterDisplayComponent
  let fixture: ComponentFixture<SearchFilterDisplayComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SearchFilterDisplayComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFilterDisplayComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
