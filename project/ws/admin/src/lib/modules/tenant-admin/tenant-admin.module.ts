import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'

import { TenantAdminRoutingModule } from './tenant-admin-routing.module'
import { TenantAdminComponent } from './tenant-admin.component'
import {
  MatToolbarModule,
  MatIconModule,
  MatButtonModule,
  MatTooltipModule,
  MatListModule,
  MatSidenavModule,
  MatCardModule,
  MatExpansionModule,
  MatRadioModule,
  MatChipsModule,
  MatInputModule,
  MatFormFieldModule,
  MatDialogModule,
  MatSnackBarModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatTableModule,
  MatCheckboxModule,
  MatProgressSpinnerModule,
  MatButtonToggleModule,
  MatSlideToggleModule,
  MatTabsModule,
  MatDividerModule,
  MatAutocompleteModule,
  MatPaginatorModule,
} from '@angular/material'
import { HomeComponent } from './routes/page/home/home.component'
import {
  BtnPageBackModule,
  UserAutocompleteModule,
  PickerContentModule,
  UserImageModule,
} from '@ws-widget/collection'
import { RouterModule } from '@angular/router'
import { BannerComponent } from './routes/page/home/components/banner/banner.component'
import { ContentStripRequestComponent } from './routes/page/home/components/content-strip-request/content-strip-request.component'
import { IdsRequestComponent } from './routes/page/home/components/ids-request/ids-request.component'
import { ApiRequestComponent } from './routes/page/home/components/api-request/api-request.component'
import { SearchRequestComponent } from './routes/page/home/components/search-request/search-request.component'
import { TenantAdminService } from './tenant-admin.service'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { UserRolesComponent } from './routes/user-roles/user-roles.component'
import { ModifyRolesDialogComponent } from './routes/user-roles/components/modify-roles-dialog/modify-roles-dialog.component'
import { EditBannersDialogComponent } from './routes/page/home/components/edit-banners-dialog/edit-banners-dialog.component'
import { UserRegistrationComponent } from './routes/user-registration/user-registration.component'
import { RegisteredUsersComponent } from './routes/registered-users/registered-users.component'
import { DialogDeregisterUserComponent } from './routes/registered-users/components/dialog-deregister-user/dialog-deregister-user.component'
import { SystemRolesManagementComponent } from './routes/system-roles-management/system-roles-management.component'
import { RolesManagementDetailComponent } from './routes/system-roles-management/roles-management-detail/roles-management-detail.component'
import { ConfirmActionComponent } from './routes/system-roles-management/roles-management-detail/components/confirm-action/confirm-action.component'
import { UsersComponent } from './routes/users/users.component'
import { CreateUserComponent } from './routes/users/create-user/create-user.component'
import { CreateUserV2Component } from './routes/users/create-userV2/create-userV2.component'
import { OpenRolesDialogComponent } from './routes/users/components/open-roles-dialog/open-roles-dialog.component'
import { UserAccessPathComponent } from './routes/user-access-path/user-access-path.component'
import { UserBulkUploadComponent } from './routes/user-bulk-upload/user-bulk-upload.component'
import { FileService } from './upload.service'

@NgModule({
  declarations: [
    TenantAdminComponent,
    HomeComponent,
    BannerComponent,
    ContentStripRequestComponent,
    IdsRequestComponent,
    ApiRequestComponent,
    SearchRequestComponent,
    UserRolesComponent,
    ModifyRolesDialogComponent,
    EditBannersDialogComponent,
    UserRegistrationComponent,
    RegisteredUsersComponent,
    DialogDeregisterUserComponent,
    SystemRolesManagementComponent,
    RolesManagementDetailComponent,
    ConfirmActionComponent,
    UsersComponent,
    CreateUserComponent,
    CreateUserV2Component,
    OpenRolesDialogComponent,
    UserAccessPathComponent,
    UserBulkUploadComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TenantAdminRoutingModule,
    UserAutocompleteModule,
    RouterModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    BtnPageBackModule,
    MatCardModule,
    MatExpansionModule,
    MatRadioModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    PickerContentModule,
    DragDropModule,
    MatCardModule,
    MatDialogModule,
    MatListModule,
    MatCardModule,
    MatInputModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatDividerModule,
    UserImageModule,
    MatAutocompleteModule,
    MatPaginatorModule,
  ],
  providers: [TenantAdminService, FileService],
  entryComponents: [ModifyRolesDialogComponent,
    EditBannersDialogComponent,
    DialogDeregisterUserComponent,
    ConfirmActionComponent,
    OpenRolesDialogComponent],
})
export class TenantAdminModule { }
