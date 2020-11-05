import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SocialSearchComponent } from './social-search.component'

describe('SocialSearchComponent', () => {
  let component: SocialSearchComponent
  let fixture: ComponentFixture<SocialSearchComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SocialSearchComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialSearchComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
