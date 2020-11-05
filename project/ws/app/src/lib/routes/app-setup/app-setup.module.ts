import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { AppSetupRoutingModule } from './app-setup-routing.module'
import { AppSetupHomeComponent } from './app-setup-home.component'
import {
  MatStepperModule,
  MatFormFieldModule,
  MatInputModule,
  MatCardModule,
  MatIconModule,
  MatButtonModule,
  MatRadioModule,
  MatSelectModule,
  MatExpansionModule,
  MatMenuModule,
  MatToolbarModule,
  MatCheckboxModule,
  MatDividerModule,
  MatDialogModule,
} from '@angular/material'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SettingsModule } from '../profile/routes/settings/settings.module'
import { WidgetResolverModule } from '@ws-widget/resolver'
import {
  LocaleTranslatorModule,
  LanguageSelectorModule,
  AppTourDialogModule,
  BtnPageBackModule,
} from '@ws-widget/collection'
import { AboutVideoModule } from '../info/about-video/about-video.module'
import { HomeComponent } from './components/home/home.component'
import { LangSelectComponent } from './components/lang-select/lang-select.component'
import { TncComponent } from './components/tnc/tnc.component'
import { TncRendererComponent } from './components/tnc-renderer/tnc-renderer.component'
import { PipeSafeSanitizerModule } from '../../../../../../../library/ws-widget/utils/src/public-api'
import { TncAppResolverService } from '../../../../../../../src/app/services/tnc-app-resolver.service'
import { SetupDoneComponent } from './components/setup-done/setup-done.component'
import { InterestModules } from './module/interest/interest.module'
import { Globals } from './globals'
import { InterestModule } from '../profile/routes/interest/interest.module'

@NgModule({
  declarations: [
    AppSetupHomeComponent,
    HomeComponent,
    LangSelectComponent,
    TncComponent,
    TncRendererComponent,
    SetupDoneComponent,
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
    AboutVideoModule,
    WidgetResolverModule,
    LocaleTranslatorModule,
    InterestModules,
    LanguageSelectorModule,
    AppTourDialogModule,
    InterestModule,
  ],
  providers: [TncAppResolverService, Globals],
})
export class AppSetupModule { }
