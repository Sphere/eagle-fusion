import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ChangeChampionsComponent } from './change-champions.component'

describe('ChangeChampionsComponent', () => {
  let component: ChangeChampionsComponent
  let fixture: ComponentFixture<ChangeChampionsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChangeChampionsComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeChampionsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
