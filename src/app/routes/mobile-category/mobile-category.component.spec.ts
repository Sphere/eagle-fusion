import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { MobileCategoryComponent } from './mobile-category.component'

describe('MobileCategoryComponent', () => {
  let component: MobileCategoryComponent
  let fixture: ComponentFixture<MobileCategoryComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MobileCategoryComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileCategoryComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
