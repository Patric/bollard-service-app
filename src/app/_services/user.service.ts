import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {



  constructor(
    private http: HttpClient
    ) {

   }

   getUserData() {
    return this.http.get(`${environment.apiUrl}/getUserData`);
   }

   getUserOrderCodes(){
     return this.http.get(`${environment.apiUrl}/getOrderCodes`);
   }
}
