import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';

import { LoginPage } from './login.page';

const routes: Routes = [
  {
    path: '',
    component: LoginPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginPageRoutingModule {

   // navigate to profile if logged in
   constructor(private authService: AuthService, private router: Router) {
    if(this.authService.currentUserValue){
      this.router.navigate(['/profile']);
    }
  }
}
