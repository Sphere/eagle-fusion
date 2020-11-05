import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { FsHomeComponent } from './fs-home.component'

describe('FsHomeComponent', () => {
  let component: FsHomeComponent
  let fixture: ComponentFixture<FsHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FsHomeComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(FsHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
