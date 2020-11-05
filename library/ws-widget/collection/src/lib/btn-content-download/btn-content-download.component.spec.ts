import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnContentDownloadComponent } from './btn-content-download.component'

describe('BtnContentDownloadComponent', () => {
  let component: BtnContentDownloadComponent
  let fixture: ComponentFixture<BtnContentDownloadComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnContentDownloadComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnContentDownloadComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
