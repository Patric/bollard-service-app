import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { User } from '../_models/user';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { map } from 'rxjs/operators';

import { environment } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //To get current value
  private currentUserSubject: BehaviorSubject<User>;
  //To subscribe to
  public currentUser: Observable<User>;
  

  private url = environment.apiUrl;
  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json', 'Authorization' : 'no-token'})
  };
  users: Array<any>;


  constructor
  (
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) 
  { 
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }


  authenticate(email$: string, pass$: string)
  {
    // this.http.post
    // (
    //   `${this.url}/authenticate`, 
    //   {email: email$, pass: pass$},
    //   this.httpOptions
    // ).subscribe((x: any) => 
    // {
    //   this.httpOptions.headers.set('Authorization', x.token);
    //   this.cookieService.set('jwt-token', x.token);
    //   localStorage.setItem("token", x.token);
    // });

    return this.http.post
    (
      `${this.url}/authenticate`, 
      {email: email$, pass: pass$},
      this.httpOptions
      // map emits a new transformed observable, pipe used to combine functions
      // store user details and jwt token in local storage to keep user logged in between page refreshes
    ).pipe(map((res: any) => {
      localStorage.setItem('currentUser', JSON.stringify(res.user));
      this.currentUserSubject.next(res.user);
          return res;
    }));



      //console.log("type: ", typeof(x));
      //TO DO
      //ADD VALIDATION
      //this.router.navigateByUrl("/profile");


    //const url = `${this.userUrl}?email=^${email}`;
    //console.log(`Getting user ${url}`)
    //console.log(this.http.get<User>(url));
    //return this.http.get<User>(url);  
  }
    




}
