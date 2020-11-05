import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { GeneralGuard } from 'src/app/guards/general.guard'
import { UserRegistrationComponent } from './routes/user-registration/user-registration.component'
import { TenantAdminComponent } from './tenant-admin.component'
import { TenantAdminResolverService } from './service/tenant-admin-resolver.service'
import { RegisteredUsersComponent } from './routes/registered-users/registered-users.component'
import { SystemRolesManagementComponent } from './routes/system-roles-management/system-roles-management.component'
import { RolesManagementDetailComponent } from './routes/system-roles-management/roles-management-detail/roles-management-detail.component'
import { CreateUserComponent } from './routes/users/create-user/create-user.component'
import { CreateUserV2Component } from './routes/users/create-userV2/create-userV2.component'
import { UsersComponent } from './routes/users/users.component'
import { UserAccessPathComponent } from './routes/user-access-path/user-access-path.component'
import { UserBulkUploadComponent } from './routes/user-bulk-upload/user-bulk-upload.component'
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
  },
  {
    path: 'user-registration',
    component: UserRegistrationComponent,
    canActivate: [GeneralGuard],
    data: {
      requiredFeatures: ['adminFeatureUserRegistration'],
    },
  },
  {
    path: 'registered-users',
    component: RegisteredUsersComponent,
    canActivate: [GeneralGuard],
    data: {
      requiredFeatures: ['adminFeatureRegisteredUsers'],
    },
  },
  {
    path: 'access-path',
    component: UserAccessPathComponent,
    data: {
      requiredRoles: ['admin', 'register-admin'],
    },
  },
  {
    path: 'user-bulk-upload',
    component: UserBulkUploadComponent,
    data: {
      requiredRoles: ['admin', 'register-admin'],
    },
  },
  {
    path: 'system-roles-management',
    canActivate: [GeneralGuard],
    data: {
      requiredFeatures: ['adminFeatureSystemRolesMgmt'],
    },
    children: [
      {
        path: '',
        component: SystemRolesManagementComponent,
        pathMatch: 'full',
      },
      {
        path: 'roles',
        component: RolesManagementDetailComponent,
      },
    ],
  },
  {
    path: 'users',
    canActivate: [GeneralGuard],
    data: {
      requiredFeatures: ['adminFeatureUsers'],
    },
    children: [
      {
        path: '',
        component: UsersComponent,
      },
      {
        path: 'create-user',
        component: CreateUserComponent,
      },
      {
        path: 'create-user-v2',
        component: CreateUserV2Component,
      },
    ],
  },
  {
    path: 'content-assignment',
    loadChildren: () =>
      import('../../../../../app/src/lib/routes/content-assignment/content-assignment.module').then(
        u => u.ContentAssignmentModule,
      ),
    canActivate: [GeneralGuard],
    data: {
      requiredFeatures: ['adminFeatureContentAssignment'],
    },
  },
]

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: TenantAdminComponent,
        children: routes,
        data: {
          key: 'tenant-admin',
        },
        resolve: {
          featureData: TenantAdminResolverService,
        },
      },
    ]),
  ],
  exports: [RouterModule],
})
export class TenantAdminRoutingModule {}
