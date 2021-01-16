import { NgModule } from '@angular/core';
import { PreloadAllModules, Router, RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './_guards/auth.guard';
import { AuthService } from './_services/auth.service';




const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'registration',
    loadChildren: () => import('./pages/registration/registration.module').then( m => m.RegistrationPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'authenticated',
    loadChildren: () => import('./pages/authenticated/authenticated.module').then( m => m.AuthenticatedPageModule),
    canActivate: [AuthGuard]
  },

];
//dsad
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { 
 // navigate to profile if logged in
 constructor(private authService: AuthService, private router: Router) {
  if(this.authService.isLoggedIn){
    // console.log("App routing redirect triggered");
    // this.router.navigate(['/authenticated']);
  }
}

}
export { RouterModule };
