import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { PlayerPdfComponent } from './player-pdf.component'

describe('PlayerPdfComponent', () => {
  let component: PlayerPdfComponent
  let fixture: ComponentFixture<PlayerPdfComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerPdfComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerPdfComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
