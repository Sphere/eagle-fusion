import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WebHowDoesWorkComponent } from './web-how-does-work.component'

describe('MobileHowDoesWorkComponent', () => {
  let component: WebHowDoesWorkComponent
  let fixture: ComponentFixture<WebHowDoesWorkComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WebHowDoesWorkComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WebHowDoesWorkComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
