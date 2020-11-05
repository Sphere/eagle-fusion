import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { IntranetSelectorComponent } from './intranet-selector.component'

describe('IntranetSelectorComponent', () => {
  let component: IntranetSelectorComponent
  let fixture: ComponentFixture<IntranetSelectorComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IntranetSelectorComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(IntranetSelectorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
