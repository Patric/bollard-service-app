import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { AuthService } from '../../_services/auth.service';

import { ForgotPasswordPage } from './forgot-password.page';

const routes: Routes = [
  {
    path: '',
    component: ForgotPasswordPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ForgotPasswordPageRoutingModule {
   // navigate to profile if logged in
   constructor(private authService: AuthService, private router: Router) {
    if(this.authService.currentUserValue){
      this.router.navigate(['/authenticated']);
    }
  }
}
