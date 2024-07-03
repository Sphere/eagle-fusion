import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing'
import { CarouselComponentComponent } from './carousel-component.component'

describe('CarouselComponentComponent', () => {
  let component: CarouselComponentComponent
  let fixture: ComponentFixture<CarouselComponentComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CarouselComponentComponent]
    })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(CarouselComponentComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize with default values', () => {
    expect(component.currentIndex).toBe(0)
    expect(component.currentSlideIndex).toBe(0)
  })


  it('should stop carousel on destroy', () => {
    spyOn(window, 'clearInterval')
    component.ngOnDestroy()
    expect(window.clearInterval).toHaveBeenCalled()
  })

  it('should navigate to next slide', () => {
    component.dataCarousel = [{}, {}]
    component.currentSlideIndex = 0
    component.nextSlide()
    expect(component.currentSlideIndex).toBe(1)
  })

  it('should navigate to previous slide', () => {
    component.dataCarousel = [{}, {}]
    component.currentSlideIndex = 1
    component.prevSlide()
    expect(component.currentSlideIndex).toBe(0)
  })

  it('should manually navigate to a specific slide', fakeAsync(() => {
    spyOn(component, 'clearInterval')
    component.goToSlide(1)
    tick(0)
    expect(component.currentIndex).toBe(1)
    expect(component.currentSlideIndex).toBe(1)
    expect(component.clearInterval).toHaveBeenCalled()
  }))

  it('should emit scroll event when scrolling to "How Sphere Works"', () => {
    spyOn(component.scrollService.scrollToDivEvent, 'emit')
    component.scrollToHowSphereWorks('scrollToHowSphereWorks')
    expect(component.scrollService.scrollToDivEvent.emit).toHaveBeenCalledWith('scrollToHowSphereWorks')
  })
})
