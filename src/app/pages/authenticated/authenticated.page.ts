import { HttpClient } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuController, NavController } from '@ionic/angular';
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
      url: ['/authenticated', 'profile'],
      icon: 'person'
    }
  ];
  servicePages = [
    {
      title: 'Operations',
      url: ['/authenticated', 'operations'],
      icon: 'settings'
    },
    {
      title: 'Guide',
      url: ['/authenticated', 'guide'],
      icon: 'information-circle'
    }
  ];

  constructor
  ( 
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone,
    private menu: MenuController,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController
  ) {}
  ngOnDestroy(): void {
  }

  ngOnInit() {
   this.navCtrl.navigateRoot(['/authenticated', 'profile']);
  }

  logEvent(){
    this.http.get
    (
      `${environment.apiUrl}/someInfo`,
      this.authService.httpOptions
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

  logout(){
    this.authService.logout();
  }


}
