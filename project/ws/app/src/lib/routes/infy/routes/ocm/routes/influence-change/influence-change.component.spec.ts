import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { InfluenceChangeComponent } from './influence-change.component'

describe('InfluenceChangeComponent', () => {
  let component: InfluenceChangeComponent
  let fixture: ComponentFixture<InfluenceChangeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InfluenceChangeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(InfluenceChangeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
