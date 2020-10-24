import { Injectable, OnInit } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { User } from '../_models/user';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';


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
    headers: new HttpHeaders({'Content-Type': 'application/json', Authorization: 'token'}),
    withCredentials: true
  };
  users: Array<any>;
  private cookieExpMin: number;

  constructor
  (
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) 
  { 
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(this.getCookies(['id', 'token'])));
    this.currentUser = this.currentUserSubject.asObservable();
    this.cookieExpMin = 15;
    //console.log("Value: ", this.currentUserValue);
  }

  getCookies(cookies: string[]){
  var stringified = '{';
  for(let i = 0; i < cookies.length; i++)
  {
    // any missing cookie leads to logout
    if(this.cookieService.check(cookies[i]) == false){return null;}

    stringified += `${JSON.stringify(cookies[i])}:${JSON.stringify(this.cookieService.get(cookies[i]))},`
  }
  stringified = stringified.slice(0, -1);
  stringified += '}';
  return stringified;
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  authenticate(email$: string, pass$: string)
  {
    return this.http.post
    (
      `${this.url}/authenticate`,
      {email: email$, pass: pass$},
      this.httpOptions
      // map emits a new transformed observable, pipe used to combine functions
      // store user details and jwt token in local storage to keep user logged in between page refreshes
    ).pipe(map((user: any) => {
   
      /// DELETE
     // localStorage.setItem('currentUser', JSON.stringify(user));
      
      const expDate = new Date();
      expDate.setMinutes(expDate.getMinutes() + this.cookieExpMin);
      this.cookieService.set(
        'id', // name 
        (decodeURIComponent(user.id)), // value
        expDate, // cookie expiration in addition to session expiration 
        null, // path
        null, //domain
        null, // secure SET TO TRUE
      );
      this.cookieService.set(
        'token', // name 
        (decodeURIComponent(user.token)), // value
        expDate, // cookie expiration in addition to session expiration 
        null, // path
        null, //domain
        null, // secure
      );
      
   

      this.currentUserSubject.next(user);
          return user;
    }));
    
  }



  logout(){
    //localStorage.removeItem('currentUser');

    this.cookieService.deleteAll();

    this.currentUserSubject.next(null);
  }
    




}
