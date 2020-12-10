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

  private connectionStatus$: BehaviorSubject<any>;
  private connectedDeviceAdr$: BehaviorSubject<any>;

 
  // Bonding with html
  private devicesFound;
  private message;

  constructor

  ( private bluetoothService: BluetoothService,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone,
  ) {
  }


  ngOnInit() {

 


    this.bluetoothService.ready().then(()=>{

     
      this.connectionStatus$ = new BehaviorSubject<any>(null);
      this.connectedDeviceAdr$ = new BehaviorSubject<any>(null);

      // ngZone forces instant update on html side
     
      this.bluetoothService.ble.getDevicesFound().subscribe((devicesFound) => {this.ngZone.run( () => {
          this.devicesFound = devicesFound;
        });
      }, 
      (err) => console.error("this.bluetoothService.getDevicesFound() error", err));
   

      
      this.bluetoothService.ble.getMessage().subscribe((message) => {
        this.ngZone.run( () => {

          if(message != null && message != undefined){
            this.message = message;
          }
         
        });
      }, 
      (err) => console.error("this.bluetoothService.getMessage() error", err));

      this.bluetoothService.ble.getConnectedDevice().subscribe((deviceInfo) => {
        
          console.log("Connected device: ", JSON.stringify(deviceInfo));
          this.connectionStatus$.next(deviceInfo.status);
          // troublesome part. deviceInfo can either be returned as one value(e.g "closed") or in json format e.g:
          //("status: connected",
          // "address: 00:00:00:000",                                                                
          // "service": "1101")
          // that is due to bluetoothLE plugin imperfection
          // try and catch is necessary to catch deviceInfo.address error in case when the response in "closed", "connecting" format.
          this.ngZone.run( () => {
          
            this.connectedDeviceAdr$.next(deviceInfo.address);
          });
          
          try{
            if(deviceInfo.address != undefined && deviceInfo.address != null){
              
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
    this.bluetoothService.ble.disconnect();
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

  }
  startScan(){
    this.bluetoothService.ble.startScanning();
  
  }
  
  connect(dvc_address: string){
      this.bluetoothService.ble.connect(dvc_address);

  }

  closeConnection(){
    this.bluetoothService.ble.closeConnection(this.connectedDeviceAdr$.value);
  }

  logout(){
    this.authService.logout();

  }

}
