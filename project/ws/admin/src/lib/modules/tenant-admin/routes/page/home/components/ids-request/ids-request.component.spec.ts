import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { IdsRequestComponent } from './ids-request.component'

describe('IdsRequestComponent', () => {
  let component: IdsRequestComponent
  let fixture: ComponentFixture<IdsRequestComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IdsRequestComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(IdsRequestComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
