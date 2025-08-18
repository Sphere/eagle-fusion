import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import { ErrorResolverComponent } from './error-resolver.component'
import { ErrorAccessForbiddenComponent } from './components/error-access-forbidden/error-access-forbidden.component'
import { ErrorContentUnavailableComponent } from './components/error-content-unavailable/error-content-unavailable.component'
import { ErrorFeatureDisabledComponent } from './components/error-feature-disabled/error-feature-disabled.component'
import { ErrorFeatureUnavailableComponent } from './components/error-feature-unavailable/error-feature-unavailable.component'
import { ErrorInternalServerComponent } from './components/error-internal-server/error-internal-server.component'
import { ErrorNotFoundComponent } from './components/error-not-found/error-not-found.component'
import { ErrorServiceUnavailableComponent } from './components/error-service-unavailable/error-service-unavailable.component'
import { ErrorSomethingWrongComponent } from './components/error-something-wrong/error-something-wrong.component'

import { MatButtonModule } from '@angular/material/button'

@NgModule({
    declarations: [
        ErrorResolverComponent,
        ErrorAccessForbiddenComponent,
        ErrorContentUnavailableComponent,
        ErrorFeatureDisabledComponent,
        ErrorFeatureUnavailableComponent,
        ErrorInternalServerComponent,
        ErrorNotFoundComponent,
        ErrorServiceUnavailableComponent,
        ErrorSomethingWrongComponent,
    ],
    imports: [CommonModule, MatButtonModule, RouterModule]
})
export class ErrorResolverModule { }
