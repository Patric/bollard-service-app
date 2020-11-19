import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, defineInjectable, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../_services/auth.service';

import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { BluetoothService } from '../_services/bluetooth.service';



@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {

  private response: Observable<Array<any>>;
  private devicesFound$: BehaviorSubject<Array<any>>;

  private connectedDeviceAdr$: BehaviorSubject<any>;

  constructor
  (
    private http: HttpClient,
    private router: Router,
    private bluetoothService: BluetoothService,
    private authService: AuthService,
    private ngZone: NgZone
  ) {
  }


  ngOnInit() {
    this.devicesFound$ = new BehaviorSubject<Array<any>>(null);
    this.connectedDeviceAdr$ = new BehaviorSubject<any>(null);
 

  }

  ngOnDestroy(){
    
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
    this.bluetoothService.read();
  }
  startScan(){
    this.bluetoothService.startScanning();
    this.bluetoothService.getDevicesFound().subscribe((devicesFound) => {
      this.ngZone.run( () => {this.devicesFound$.next(devicesFound); });
    });

  }
  stopScan(){
    this.bluetoothService.stopScanning();
  }

  connect(dvc_address: string){
      this.bluetoothService.connect(dvc_address).subscribe((deviceInfo) => {
        console.log("NEW CONNECTION STATUS IN PAGE.TS", deviceInfo.address);
        this.ngZone.run( () => {
          this.connectedDeviceAdr$.next(deviceInfo.address);
         
        });
      });;;

     
      //this.updateConnected();

  }






  closeConnection(){
   // console.log(this.connectedDeviceAdr$.getValue());
    
    this.bluetoothService.closeConnection(this.connectedDeviceAdr$.getValue()).subscribe((deviceInfo) => {
      console.log("NEW CONNECTION STATUS IN PAGE.TS", deviceInfo.address);
      this.ngZone.run( () => {
        this.connectedDeviceAdr$.next(deviceInfo.address);
       
      });
    });;;
    //this.updateConnected();
  }

  logout(){
    this.authService.logout();
  
  }

  // helper functions

  updateConnected(){
    this.bluetoothService.getConnectedDevices().subscribe((deviceInfo) => {
      console.log("NEW CONNECTION STATUS IN PAGE.TS", deviceInfo.address);
      this.ngZone.run( () => {
        this.connectedDeviceAdr$.next(deviceInfo.address);
       
      });
    });;

  }

}
