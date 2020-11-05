import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { FilterDispalyComponent } from './filter-dispaly.component'

describe('FilterDispalyComponent', () => {
  let component: FilterDispalyComponent
  let fixture: ComponentFixture<FilterDispalyComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FilterDispalyComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterDispalyComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
