import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, defineInjectable, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../_services/auth.service';

import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';


import { BluetoothWebService } from '../_services/bluetooth/platform-services/bluetooth-web.service'
import { BluetoothService } from '../_services/bluetooth/bluetooth.service';
import { Platform } from '@ionic/angular';


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
  private message;

  constructor

  ( private bluetoothService: BluetoothService,
    private http: HttpClient,
    private router: Router,
  //  private bluetoothNativeService: bluetoothService,
    private authService: AuthService,
    private ngZone: NgZone,
  ) {
  }


  ngOnInit() {
    this.bluetoothService.canInitiateBluetooth().then(()=>{

    
      this.connectedDevice$ = new BehaviorSubject<any>(null);
      this.connectedDeviceAdr$ = new BehaviorSubject<any>(null);

      this.bluetoothService.getDevicesFound().subscribe((devicesFound) => {this.ngZone.run( () => {
          this.devicesFound = devicesFound;
        });
      }, 
      (err) => console.error("this.bluetoothService.getDevicesFound() error", err));
   

      this.bluetoothService.getMessage().subscribe((message) => {
        this.ngZone.run( () => {

          if(message != null && message != undefined){
            this.message = message;
          }
         
        });
      }, 
      (err) => console.error("this.bluetoothService.getMessage() error", err));

 

      this.bluetoothService.getConnectedDevices().subscribe((deviceInfo) => {
          this.connectedDevice$.next(deviceInfo);

          //console.log("devieInfo in page", `${deviceInfo}`);
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
            console.error("deviceInfo.address is null. It should be null only during initialisation or in browser mode.", error);
          }      
        
      });
  }, 
  (err) => console.error("this.bluetoothService.getConnectedDevices() error", err));
  }

  ngOnDestroy(){
    
  }
  reset(){
    this.bluetoothService.disconnect();
    //this.bluetoothWebService.disconnect();
    //this.bluetoothService.closeConnection(this.connectedDeviceAdr$.value);
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
    this.bluetoothService.startScanning();
    
    
    //this.bluetoothWebService.startScanning();
   // this.bluetoothWebService.getMessage().subscribe(message => console.log("Message in Page: ", message));
  }
  stopScan(){
    this.bluetoothService.stopScanning();
  }

  connect(dvc_address: string){
      this.bluetoothService.connect(dvc_address);

     
      //this.updateConnected();

  }






  closeConnection(){
   // console.log(this.connectedDeviceAdr$.getValue());
    
    this.bluetoothService.closeConnection(this.connectedDevice$.value.address);
   // console.log("AFER CLOSING: ", this.connectedDevice$.value, this.connectedDeviceAdr$.value);
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
