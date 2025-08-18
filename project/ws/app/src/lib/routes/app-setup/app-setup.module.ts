import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { AppSetupRoutingModule } from './app-setup-routing.module'
import { AppSetupHomeComponent } from './app-setup-home.component'
import { MatStepperModule } from '@angular/material/stepper'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatRadioModule } from '@angular/material/radio'
import { MatSelectModule } from '@angular/material/select'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatMenuModule } from '@angular/material/menu'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatDividerModule } from '@angular/material/divider'
import { MatDialogModule } from '@angular/material/dialog'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SettingsModule } from '../profile/routes/settings/settings.module'
import { WidgetResolverModule } from '@ws-widget/resolver'
import {
  LocaleTranslatorModule,
  LanguageSelectorModule,
  BtnPageBackModule,
} from '@ws-widget/collection'
// import { AboutVideoModule } from '../info/about-video/about-video.module'
import { HomeComponent } from './components/home/home.component'
import { LangSelectComponent } from './components/lang-select/lang-select.component'
import { TncComponent } from './components/tnc/tnc.component'
import { TncRendererComponent } from './components/tnc-renderer/tnc-renderer.component'
import { PipeSafeSanitizerModule } from '../../../../../../../library/ws-widget/utils/src/public-api'
import { TncAppResolverService } from '../../../../../../../src/app/services/tnc-app-resolver.service'
// import { SetupDoneComponent } from './components/setup-done/setup-done.component'
import { InterestModules } from './module/interest/interest.module'
import { Globals } from './globals'
// import { InterestModule } from '../profile/routes/interest/interest.module'

@NgModule({
  declarations: [
    AppSetupHomeComponent,
    HomeComponent,
    LangSelectComponent,
    TncComponent,
    TncRendererComponent,
    // SetupDoneComponent,
  ],
  imports: [
    CommonModule,
    AppSetupRoutingModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatRadioModule,
    MatSelectModule,
    MatExpansionModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    MatCheckboxModule,
    PipeSafeSanitizerModule,
    MatToolbarModule,
    BtnPageBackModule,

    SettingsModule,
    // AboutVideoModule,
    WidgetResolverModule,
    LocaleTranslatorModule,
    InterestModules,
    LanguageSelectorModule,
    // InterestModule,
  ],
  providers: [TncAppResolverService, Globals],
})
export class AppSetupModule { }
