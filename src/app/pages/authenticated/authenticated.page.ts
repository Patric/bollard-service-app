import { HttpClient } from '@angular/common/http';
import { Component, Injector, NgZone, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, MenuController, NavController } from '@ionic/angular';
import { AppComponent } from 'src/app/app.component';
import { AuthService } from 'src/app/_services/auth.service';
import { environment } from 'src/environments/environment';



@Component({
  selector: 'app-authenticated',
  templateUrl: './authenticated.page.html',
  styleUrls: ['./authenticated.page.scss'],
})
export class AuthenticatedPage implements OnInit {

 
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

  dark = true;

  private currentRoute;
  private componentTitle = "Starter"
  
  constructor
  ( 
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone,
    private menu: MenuController,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private injector: Injector
    
  ) {

   
  }
  toggleDark(){
    this.injector.get(AppComponent).setDark();
  }
  ngOnDestroy(): void {
    
  }

  ngOnInit() {

  }

  logEvent(){
    this.http.get
    (
      `${environment.apiUrl}/someInfo`
      // map emits a new transformed observable, pipe used to combine functions
      // store user details and jwt token in local storage to keep user logged in between page refreshes
    ).subscribe((res: any) =>{ } );
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
