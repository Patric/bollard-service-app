import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { User } from '../_models/user';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private userUrl = 'api/users'; // URL to web api
  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json', 'Authorization' : 'no-token'})
  };
  users: Array<any>;
  


  constructor
  (
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) { }

  fakeBackendTest(){
    if(this.users != undefined){
      console.log(this.users);
    }
    
    this.http.get("http://localhost:8100/users").subscribe( (res: any) => this.users = res.users );
   
  
    
  }

  validate(email$: string, pass$: string): void
  {
    this.http.post
    (
      "http://localhost:8100/authenticate", 
      {email: email$, pass: pass$},
      this.httpOptions
    ).subscribe((x: any) => 
    {
      this.httpOptions.headers.set('Authorization', x.token);
      this.cookieService.set('jwt-token', x.token);
      localStorage.setItem("token", x.token); 


      //console.log("type: ", typeof(x));
      //TO DO
      //ADD VALIDATION
      this.router.navigateByUrl("/profile");

        
      
    });

    //const url = `${this.userUrl}?email=^${email}`;
    //console.log(`Getting user ${url}`)
    //console.log(this.http.get<User>(url));
    //return this.http.get<User>(url);  
  }

  getUsers(): Observable<User[]>{
    return this.http.get<User[]>(this.userUrl);
  }

}
