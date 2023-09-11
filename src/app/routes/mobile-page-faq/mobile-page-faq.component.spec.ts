import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { MobilePageFaqComponent } from './mobile-page-faq.component'

describe('MobilePageFaqComponent', () => {
  let component: MobilePageFaqComponent
  let fixture: ComponentFixture<MobilePageFaqComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MobilePageFaqComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MobilePageFaqComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
