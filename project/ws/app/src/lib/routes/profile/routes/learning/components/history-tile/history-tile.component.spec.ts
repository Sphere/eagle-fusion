import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { HistoryTileComponent } from './history-tile.component'

describe('HistoryTileComponent', () => {
  let component: HistoryTileComponent
  let fixture: ComponentFixture<HistoryTileComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HistoryTileComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryTileComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
