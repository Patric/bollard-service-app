import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../_services/auth.service';

import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';





@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  constructor
  (
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
    private authService: AuthService
  ) {}

  ngOnInit() {
  }


  logEvent(){
    console.log("request to",  `${environment.apiUrl}/someInfo`);
    this.http.get
    (
      `${environment.apiUrl}/someInfo`,
      this.authService.httpOptions
      // map emits a new transformed observable, pipe used to combine functions
      // store user details and jwt token in local storage to keep user logged in between page refreshes
    ).pipe(map((res: any) => {
      console.log(res);
    }
    )).subscribe();
    


  }

}
