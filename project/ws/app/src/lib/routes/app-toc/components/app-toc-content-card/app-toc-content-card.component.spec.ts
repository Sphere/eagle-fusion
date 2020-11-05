import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { AppTocContentCardComponent } from './app-toc-content-card.component'

describe('AppTocContentCardComponent', () => {
  let component: AppTocContentCardComponent
  let fixture: ComponentFixture<AppTocContentCardComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppTocContentCardComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(AppTocContentCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
