import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { LocaleTranslatorComponent } from './locale-translator.component'

describe('LocaleTranslatorComponent', () => {
  let component: LocaleTranslatorComponent
  let fixture: ComponentFixture<LocaleTranslatorComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LocaleTranslatorComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(LocaleTranslatorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
