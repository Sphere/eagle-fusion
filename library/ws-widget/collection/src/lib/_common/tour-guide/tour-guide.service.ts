import { EventEmitter, Injectable } from '@angular/core'
import { NavigationEnd, NavigationStart, Router } from '@angular/router'
import { ConfigurationsService } from '../../../../../utils/src/public-api'
declare const Shepherd: any

@Injectable({
  providedIn: 'root',
})

export class CustomTourService {

  public data: any = []
  isnavigation = false
  tour: any
  popupTour: any
  isTourComplete = new EventEmitter<boolean>()

  constructor(
    private router: Router,
    private configsvc: ConfigurationsService

  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.cancelTour()
      } else if (event instanceof NavigationEnd) {
        this.cancelTour()
      }
    })
  }

  public startTour() {
    let classe = ' '
    if (this.configsvc.userPreference) {
      if (this.configsvc.userPreference.isDarkMode) {
        classe = 'tour-darkmode'
      } else {
        classe = 'class-1 class-2'
      }
    }
    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: true,
        },
        classes: classe,
      },
      exitOnEsc: true,
      // keyboardNavigation: true,
      useModalOverlay: {
        enabled: true,
      },
    })
    for (let i = 0; i < this.data.length; i += 1) {
      const container = document.getElementById((this.data[i][0]).slice(1))
      if (container && container.children && container.children.length) {
        const buttons: any = []
        // no back button at the start
        if (i > 0) {
          buttons.push({
            text: 'Back',
            classes: 'shepherd-button-secondary',
            action() {
              return tour.back()
            },
          })
        }
        // no next button on last step
        if (i !== (this.data.length - 1)) {
          buttons.push({
            text: 'Next',
            classes: 'shepherd-button-primary ws-mat-primary-background',

            action() {
              return tour.next()
            },
          })
        } else {
          buttons.push({
            text: 'Close',
            classes: 'shepherd-button-primary ws-mat-primary-background',
            action() {
              tour.cancel()
            },
          })
        }
        tour.addStep({
          buttons,
          text: this.data[i][2],
          title: this.data[i][1],
          scrollTo: { behavior: 'smooth', block: 'center' },
          attachTo: {
            element: this.data[i][0],
            on: 'right',
          },
          id: i + 1,
        }
        )
      }
    }
    tour.start()
    this.tour = tour
    this.tour.on('cancel', () => {
      if (this.tour) {
        this.isTourComplete.emit(true)
        return true
      }
      return false
    })
    return false
  }
  public cancelTour() {
    if (this.tour) {
      this.tour.cancel()
      this.isTourComplete.emit(true)
    }
  }

  public createPopupTour() {
    const buttons: any = []
    let classe = ' '
    if (this.configsvc.userPreference) {
      if (this.configsvc.userPreference.isDarkMode) {
        classe = 'tour-darkmode'
      } else {
        classe = 'class-1 class-2'
      }
    }
    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: false,
        },
        classes: classe,
        scrollTo: true,
      },
      exitOnEsc: {
        enabled: true,
      },
      useModalOverlay: {
        enabled: true,
      },
    })
    tour.addStep({
      buttons,
      text: 'Our Tour Guide is always available here',
      classes: classe,
      attachTo: {
        element: '#helper',
        on: 'bottom',
      },
    }
    )
    this.popupTour = tour
    return tour

  }
  public startPopupTour() {
    if (this.popupTour) {
      this.popupTour.start()
    }
  }
  public cancelPopupTour() {
    if (this.popupTour) {
      this.popupTour.cancel()
    }

  }

}
