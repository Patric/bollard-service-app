import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class UserService 
{

private usersUrl = 'api/users'; // URL to web api

  constructor
  (
    private http: HttpClient
  ) { }

// getUser(id: number): Observable<User> {
//   const url = `${this.UsersUrl}/${id}`;
//   return this.http.get<Hero>(url).pipe(
//     tap(_ => this.log(`fetched hero id=${id}`)),
//     catchError(this.handleError<Hero>(`getHero id=${id}`))
//   );

}
