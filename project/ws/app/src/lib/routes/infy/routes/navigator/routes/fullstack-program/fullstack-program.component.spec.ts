import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { FullstackProgramComponent } from './fullstack-program.component'

describe('FullstackProgramComponent', () => {
  let component: FullstackProgramComponent
  let fixture: ComponentFixture<FullstackProgramComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FullstackProgramComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FullstackProgramComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
