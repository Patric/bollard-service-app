import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, defineInjectable, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../../_services/auth.service';

import { environment } from '../../../../environments/environment';
import { MenuController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy, AfterViewInit {



  constructor
  ( 
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone,
    private menu: MenuController,
    private activatedRoute: ActivatedRoute
  ) {

  }
  ngAfterViewInit(): void {
    //do smth
  }
  ngOnDestroy(): void {
  }

  ngOnInit() {
    
  }

  

}
