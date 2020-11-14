import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, defineInjectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../_services/auth.service';

import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { BluetoothService } from '../_services/bluetooth.service';



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
    private bluetoothService: BluetoothService,
    private authService: AuthService
  ) {}

  private response: Observable<Array<any>>;
  private devices;

  ngOnInit() {
    this.bluetoothService.getDevicesFound().subscribe((devicesFound) => {
      console.log("PROPERTY CHANGEEED", devicesFound);
      this.devices = devicesFound;
    });
  }


  logEvent(){
    this.http.get
    (
      `${environment.apiUrl}/someInfo`,
      this.authService.httpOptions
      // map emits a new transformed observable, pipe used to combine functions
      // store user details and jwt token in local storage to keep user logged in between page refreshes
    ).subscribe((res: any) =>{
      if(res.status == "401"){
        this.router.navigateByUrl(this.router.getCurrentNavigation.toString());
      }

      //console.log(res);
      this.response = res.users;
      
    } );
  
  }

  check(){
    this.bluetoothService.checkStatus();
  }
  startScan(){
    this.bluetoothService.startScan();
  }
  stopScan(){
    this.bluetoothService.stopScan();
    this.bluetoothService.getDevicesFound().subscribe((devicesFound) => {
      console.log("PROPERTY CHANGEEED", devicesFound);
      this.devices = devicesFound;
    });
  }

  logout(){
    this.authService.logout();
  
  }

}
