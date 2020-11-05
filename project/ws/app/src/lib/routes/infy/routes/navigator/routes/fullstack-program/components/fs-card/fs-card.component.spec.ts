import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { FsCardComponent } from './fs-card.component'

describe('FsCardComponent', () => {
  let component: FsCardComponent
  let fixture: ComponentFixture<FsCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FsCardComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FsCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
