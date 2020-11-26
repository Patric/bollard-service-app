import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, defineInjectable, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../_services/auth.service';

import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { BluetoothNativeService } from '../_services/bluetooth-native.service';
import { BluetoothWebService } from '../_services/bluetooth-web.service'



@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {

  private response: Observable<Array<any>>;

  private connectedDevice$: BehaviorSubject<any>;
  private connectedDeviceAdr$: BehaviorSubject<any>;

  

  private devicesFound;
  private message: string;

  constructor
  (
    private http: HttpClient,
    private router: Router,
    private bluetoothNativeService: BluetoothNativeService,
   // private bluetoothWebService: BluetoothWebService,
    private authService: AuthService,
    private ngZone: NgZone
  ) {
  }


  ngOnInit() {

    this.connectedDevice$ = new BehaviorSubject<any>(null);
    this.connectedDeviceAdr$ = new BehaviorSubject<any>(null);

    this.bluetoothNativeService.getDevicesFound().subscribe((devicesFound) => {
      this.ngZone.run( () => {
        //this.devicesFound$.next(devicesFound); 
        this.devicesFound = devicesFound;
      
      
      });
    });

    this.bluetoothNativeService.getMessage().subscribe((message) => {
      this.ngZone.run( () => {
        this.message = message;
    
  
      });
    });

    this.bluetoothNativeService.getConnectedDevices().subscribe((deviceInfo) => {
        this.connectedDevice$.next(deviceInfo);

        console.log("devieInfo in page", `${deviceInfo}`);
        try{
          if(deviceInfo.address != undefined){
            this.ngZone.run( () => {
         
              this.connectedDeviceAdr$.next(deviceInfo.address.toString());
            });
          }
          else{
    
            this.connectedDeviceAdr$.next(null);
          }

        }
        catch(error){
          console.error(error);
        }      
      
    });
  }

  ngOnDestroy(){
    
  }
  reset(){
    //this.bluetoothWebService.disconnect();
    //this.bluetoothNativeService.closeConnection(this.connectedDeviceAdr$.value);
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
    console.log("Checked");
    //this.bluetoothWebService.read();

  }
  startScan(){
    this.bluetoothNativeService.startScanning();
    //this.bluetoothWebService.startScanning();
   // this.bluetoothWebService.getMessage().subscribe(message => console.log("Message in Page: ", message));
  }
  stopScan(){
    this.bluetoothNativeService.stopScanning();
  }

  connect(dvc_address: string){
      this.bluetoothNativeService.connect(dvc_address);

     
      //this.updateConnected();

  }






  closeConnection(){
   // console.log(this.connectedDeviceAdr$.getValue());
    
    this.bluetoothNativeService.closeConnection(this.connectedDevice$.value.address);
    console.log("AFER CLOSING: ", this.connectedDevice$.value, this.connectedDeviceAdr$.value);
    //this.updateConnected();
  }

  logout(){
    this.authService.logout();
  
  }

  // helper functions

  // updateConnected(){
  //   this.bluetoothService.getConnectedDevices().subscribe((deviceInfo) => {
  //     console.log("NEW CONNECTION STATUS IN PAGE.TS", deviceInfo.address);
  //     this.ngZone.run( () => {
  //       this.connectedDevice$.next(deviceInfo.address);
       
  //     });
  //   });;

  // }

}
