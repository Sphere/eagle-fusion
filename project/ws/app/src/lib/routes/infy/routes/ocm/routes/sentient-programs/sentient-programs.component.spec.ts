import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SentientProgramsComponent } from './sentient-programs.component'

describe('SentientProgramsComponent', () => {
  let component: SentientProgramsComponent
  let fixture: ComponentFixture<SentientProgramsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SentientProgramsComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SentientProgramsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
