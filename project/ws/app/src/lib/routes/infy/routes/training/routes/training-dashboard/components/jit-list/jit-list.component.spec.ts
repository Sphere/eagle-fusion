import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { JitListComponent } from './jit-list.component'

describe('JitListComponent', () => {
  let component: JitListComponent
  let fixture: ComponentFixture<JitListComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [JitListComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(JitListComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
