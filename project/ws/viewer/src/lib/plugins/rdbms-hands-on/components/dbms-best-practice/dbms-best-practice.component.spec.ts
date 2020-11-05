import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DbmsBestPracticeComponent } from './dbms-best-practice.component'

describe('DbmsBestPracticeComponent', () => {
  let component: DbmsBestPracticeComponent
  let fixture: ComponentFixture<DbmsBestPracticeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DbmsBestPracticeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DbmsBestPracticeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
