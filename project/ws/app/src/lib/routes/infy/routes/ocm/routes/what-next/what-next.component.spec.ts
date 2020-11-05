import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WhatNextComponent } from './what-next.component'

describe('WhatNextComponent', () => {
  let component: WhatNextComponent
  let fixture: ComponentFixture<WhatNextComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WhatNextComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WhatNextComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
