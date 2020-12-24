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
  
  // Bonding with html
  private connectionInfo;
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
  ngOnDestroy(): void {
    this.disconnect();
  }


  ngOnInit() {

 


    this.bluetoothService.ready().then(()=>{

      // ngZone forces instant update on html side
      this.bluetoothService.ble.getDevicesFound().subscribe((devicesFound) => {this.ngZone.run( () => {
          this.devicesFound = devicesFound;
        });
      }, 
      (err) => console.error("this.bluetoothService.getDevicesFound() error", err));
   
//       this.bluetoothService.ble.getMessage().subscribe((message) => {this.ngZone.run( () => {
//          if(message != null && message != undefined){
//             this.message = message;
//           }
//           });
// }, 
//       (err) => console.error("this.bluetoothService.getMessage() error", err));

      this.bluetoothService.ble.getConnectionInfo().subscribe((connectionInfo) => {this.ngZone.run( () => {
        this.connectionInfo = connectionInfo;
      });},
      (err) => console.error("this.bluetoothService.ble.getConnectionInfo() error", err));

  }, 
  (err) => console.error("this.bluetoothService.ready() error", err));

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

  disconnect(){
   // this.bluetoothService.ble.disconnect();
  }

  logout(){
    if(this.connectionInfo.status == 'CONNECTED'){
    }
   
    this.authService.logout();

  }

}
