import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {
   // navigate to profile if logged in
   constructor(private authService: AuthService, private router: Router) {
    if(this.authService.currentUserValue){
      this.router.navigate(['/profile']);
    }
  }
}
