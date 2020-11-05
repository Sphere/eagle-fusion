import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DbmsPlaygroundComponent } from './dbms-playground.component'

describe('DbmsPlaygroundComponent', () => {
  let component: DbmsPlaygroundComponent
  let fixture: ComponentFixture<DbmsPlaygroundComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DbmsPlaygroundComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DbmsPlaygroundComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
