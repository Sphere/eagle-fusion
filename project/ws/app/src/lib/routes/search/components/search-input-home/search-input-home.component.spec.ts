import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SearchInputHomeComponent } from './search-input-home.component'

describe('SearchInputComponent', () => {
  let component: SearchInputHomeComponent
  let fixture: ComponentFixture<SearchInputHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SearchInputHomeComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchInputHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
