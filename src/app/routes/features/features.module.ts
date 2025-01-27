import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FeaturesComponent } from './features.component'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatCardModule } from '@angular/material/card'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { BtnFeatureModule, BtnPageBackModule } from '@ws-widget/collection'
import { WidgetResolverModule } from '@ws-widget/resolver'
import { LogoutModule } from '@ws-widget/utils'
import { AccessControlService } from '../../../../project/ws/author/src/public-api'

@NgModule({
  declarations: [FeaturesComponent],
  imports: [
    CommonModule,
    FormsModule,
    BtnFeatureModule,
    BtnPageBackModule,
    LogoutModule,
    WidgetResolverModule,
    ReactiveFormsModule,
    RouterModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,
    MatCardModule,
  ],
  exports: [FeaturesComponent],
  providers: [AccessControlService],
})
export class FeaturesModule { }
