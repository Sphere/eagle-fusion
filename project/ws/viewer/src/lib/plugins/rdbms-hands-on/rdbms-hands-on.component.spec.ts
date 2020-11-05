import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DbmsHandsOnComponent } from './rdbms-hands-on.component'

describe('DbmsHandsOnComponent', () => {
  let component: DbmsHandsOnComponent
  let fixture: ComponentFixture<DbmsHandsOnComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DbmsHandsOnComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DbmsHandsOnComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
