import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { User } from './user';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private userUrl = 'api/users'; // URL to web api
  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };



  constructor
  (
    private http: HttpClient
  ) { }

  getUser(id: number): Observable<User>
  {
    const url = `${this.userUrl}/${id}`;
    return this.http.get<User>(url);  
  }

  getUsers(): Observable<User[]>{
    return this.http.get<User[]>(this.userUrl);
  }

}
