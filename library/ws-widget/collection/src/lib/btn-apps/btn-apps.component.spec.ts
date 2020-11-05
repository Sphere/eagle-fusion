import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BtnAppsComponent } from './btn-apps.component'

describe('BtnAppsComponent', () => {
  let component: BtnAppsComponent
  let fixture: ComponentFixture<BtnAppsComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BtnAppsComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BtnAppsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
