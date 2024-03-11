import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CarouselComponentComponent } from './carousel-component.component'

describe('CarouselComponentComponent', () => {
  let component: CarouselComponentComponent
  let fixture: ComponentFixture<CarouselComponentComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CarouselComponentComponent],
    }).compileComponents()

  }))

  it('should create', () => {
    setTimeout(() => {
      fixture = TestBed.createComponent(CarouselComponentComponent)
      component = fixture.componentInstance
      fixture.detectChanges()
      expect(component).toBeTruthy()
    })
  })
})
