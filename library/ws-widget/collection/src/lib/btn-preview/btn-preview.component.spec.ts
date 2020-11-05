import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnPreviewComponent } from './btn-preview.component'

describe('BtnPreviewComponent', () => {
  let component: BtnPreviewComponent
  let fixture: ComponentFixture<BtnPreviewComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnPreviewComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnPreviewComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
