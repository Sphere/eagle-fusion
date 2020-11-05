import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AuthLanguageSelectBarComponent } from './auth-language-select-bar.component'

describe('AuthLanguageSelectBarComponent', () => {
  let component: AuthLanguageSelectBarComponent
  let fixture: ComponentFixture<AuthLanguageSelectBarComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuthLanguageSelectBarComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthLanguageSelectBarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
