
import { Component} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, MenuController } from '@ionic/angular';
import { AuthService } from 'src/app/_services/auth.service';




@Component({
  selector: 'app-authenticated',
  templateUrl: './authenticated.page.html',
  styleUrls: ['./authenticated.page.scss'],
})
export class AuthenticatedPage{

 
  accountPages = [
    {
      title: 'Profile',
      url: ['/authenticated'],
      icon: 'person'
    }
  ];
  servicePages = [
    {
      title: 'Operations',
      url: ['/authenticated', 'operations'],
      icon: 'cog'
    },
    {
      title: 'Guide',
      url: ['/authenticated', 'guide'],
      icon: 'information-circle'
    }
  ];




  
  constructor
  ( 
    private router: Router,
    private authService: AuthService,
    private menu: MenuController,
    private activatedRoute: ActivatedRoute,
    private alertCtrl: AlertController
  ) {

   
  }

  openMenu(){

    this.menu.enable(true, 'start');
    this.menu.open('start');
  }
  closeMenu(){
    this.menu.close('start');
  }


  check(){  
    console.log("Checked");
  }


  openFirst() {
    this.menu.enable(true, 'first');
    this.menu.open('first');
  }

  openEnd() {
    this.menu.open('end');
  }

  openCustom() {
    this.menu.enable(true, 'custom');
    this.menu.open('custom');
  }

 
  openOperations(){
    this.router.navigate(['operations'], {relativeTo: this.activatedRoute});
  }

  
  async logout(){
    //T O DO 
    //send request to logout
    //localStorage.removeItem('currentUser');

    const alert = await this.alertCtrl.create({
      header: 'Logout',
      buttons: [
        'Cancel',
        {
          text: 'Ok',
          handler: (data: any) => {
            return this.authService.logout();
          }
        }
      ],
      message: "Do you want to log out?",
    });

    await alert.present()
    //this.router.navigateByUrl("/");
    //this.router.navigate(['/'], { replaceUrl: true });
    //this.router.navigate(['/'], {replaceUrl: true});
  }
    


}
