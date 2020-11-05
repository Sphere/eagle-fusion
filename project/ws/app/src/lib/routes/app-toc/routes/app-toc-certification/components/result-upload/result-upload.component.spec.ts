import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ResultUploadComponent } from './result-upload.component'

describe('ResultUploadComponent', () => {
  let component: ResultUploadComponent
  let fixture: ComponentFixture<ResultUploadComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ResultUploadComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultUploadComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
