import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {

  constructor() { }

  // Preload critical resources
  preloadCriticalResources(): void {
    // Preload critical fonts
    this.preloadFont('/assets/fonts/poppins/poppins-regular.woff2')
    this.preloadFont('/assets/fonts/roboto/roboto-regular.woff2')

    // Preload critical images
    this.preloadImage('/fusion-assets/images/logo.png')
  }

  private preloadFont(href: string): void {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    link.href = href
    document.head.appendChild(link)
  }

  private preloadImage(src: string): void {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    document.head.appendChild(link)
  }

  // Bundle splitting optimization
  optimizeBundleLoading(): void {
    if ('IntersectionObserver' in window) {
      this.setupLazyLoading()
    }
  }

  private setupLazyLoading(): void {
    const lazyImages = document.querySelectorAll('img[data-lazy]')
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.dataset['lazy'] || ''
          img.classList.remove('lazy')
          imageObserver.unobserve(img)
        }
      })
    })

    lazyImages.forEach(img => imageObserver.observe(img))
  }

  // Memory optimization
  optimizeMemoryUsage(): void {
    // Clean up unused subscriptions and listeners
    this.setupRouteChangeCleanup()
  }

  private setupRouteChangeCleanup(): void {
    // Force garbage collection on route changes (development only)
    if (!window.location.hostname.includes('localhost')) return

    const cleanup = () => {
      // Clear any global timers or intervals
      if ((window as any).__cleanupTimers) {
        (window as any).__cleanupTimers.forEach((timer: number) => {
          clearTimeout(timer)
          clearInterval(timer)
        });
        (window as any).__cleanupTimers = []
      }
    }

    window.addEventListener('beforeunload', cleanup)
  }
}