import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthenticatedPage } from './authenticated.page';
import { GuideComponent } from './guide/guide.component';


const routes: Routes =  [
  {
    path: '',
    component: AuthenticatedPage,
    children: [
      {
        //Default route
        path: 'operations',
        loadChildren: () => import('./operations/operations.module').then( m => m.OperationsPageModule),
      },
      {
        path: '',
        loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
      },
      {
        path: 'guide',
        component: GuideComponent
      }
    ]

  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthenticatedPageRoutingModule {}//g
