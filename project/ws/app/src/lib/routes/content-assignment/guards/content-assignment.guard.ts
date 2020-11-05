import { Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router'
import { ContentAssignService } from '@ws-widget/collection'
import { ConfigurationsService } from '@ws-widget/utils'
import { Observable } from 'rxjs'

@Injectable()
export class ContentAssignmentGuard implements CanActivate {
  adminLevel = ''
  userType = ''
  stateUrl = ''
  routeUrl: any
  constructor(
    private configSvc: ConfigurationsService,
    private router: Router,
    private contentAssignSvc: ContentAssignService,
    private snackbar: MatSnackBar,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
    const mode = route.data['mode']
    this.stateUrl = state.url
    this.routeUrl = route.url
    return new Observable<boolean>(observer => {
      if (this.configSvc.userProfile && this.configSvc.org) {
        const reqBody = {
          pageSize: 10,
          orgs: this.configSvc.org,
          filters: {
            wid: [this.configSvc.userProfile.userId],
          },
          requiredSources: ['is_manager'],
        }

        this.contentAssignSvc.searchUsers(reqBody).subscribe(
          (data: any) => {
            if (data.result.length) {
              if (data.result[0].is_manager === true) {
                this.userType = 'manager'
              }
              this.contentAssignSvc.getAdminLevel().subscribe((adminData: any) => {
                this.adminLevel = adminData.level
                if (mode === 'assign') {
                  if (this.stateUrl.startsWith('/app/content-assignment') && this.userType === 'manager') {
                    observer.next(true)
                    observer.complete()
                    this.router.navigate(['/app/content-assignment/assign'], {
                      queryParams: {
                        userType: 'manager',
                        adminLevel: this.adminLevel,
                      },
                    })
                  } else if (this.stateUrl.startsWith('/admin/tenant/content-assignment') && (
                    this.configSvc.userRoles &&
                    (
                      this.configSvc.userRoles.has('admin') ||
                      this.configSvc.userRoles.has('content-assignment-admin')
                    ))) {
                    observer.next(true)
                    observer.complete()
                    this.router.navigate(['/admin/tenant/content-assignment/assign'], {
                      queryParams: {
                        userType: 'admin',
                        adminLevel: this.adminLevel,
                      },
                    })
                  } else {
                    observer.next(false)
                    observer.complete()
                    this.snackbar.open('You do not have access to this page')
                  }
                } else if (mode === 'view') {
                  if (this.stateUrl.startsWith('/app/content-assignment') && this.userType === 'manager') {
                    observer.next(true)
                    observer.complete()
                    this.router.navigate(['/app/content-assignment/view'], {
                      queryParams: {
                        userType: 'manager',
                      },
                    })
                  } else if (this.stateUrl.startsWith('/admin/tenant/content-assignment') && (
                    this.configSvc.userRoles &&
                    (
                      this.configSvc.userRoles.has('admin') ||
                      this.configSvc.userRoles.has('content-assignment-admin')
                    ))) {
                    observer.next(true)
                    observer.complete()
                    this.router.navigate(['/admin/tenant/content-assignment/view'], {
                      queryParams: {
                        userType: 'admin',
                      },
                    })
                  } else {
                    observer.next(false)
                    observer.complete()
                    this.snackbar.open('You do not have access to this page')
                  }
                }
              },                                              err => {
                if (err) {
                  observer.next(false)
                  observer.complete()
                  this.snackbar.open('Failed to fetch your admin level')
                }
              })
            }
          },
          err => {
            if (err) {
              observer.next(false)
              observer.complete()
              this.snackbar.open('You do not have access to this page')
            }
          }
        )
      }
    })
  }
}
