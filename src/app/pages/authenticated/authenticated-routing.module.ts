import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthenticatedPage } from './authenticated.page';


const routes: Routes =  [
  {
    path: '',
    component: AuthenticatedPage,
    children: [
      {
        path: 'operations',
        loadChildren: () => import('./operations/operations.module').then( m => m.OperationsPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
      }
    ],
  //  redirectTo: 'profile',
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthenticatedPageRoutingModule {}//g
