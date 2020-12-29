import { HttpClient } from '@angular/common/http';
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../_services/auth.service';

import { environment } from '../../../environments/environment';

import { BluetoothService } from '../../_services/bluetooth/bluetooth.service';
import { Observable } from 'rxjs';
import {BridgeService} from '../../_services/bridge.service'


// TO BE DELTED
import { SHA } from '../../_interceptors/crypto';

@Component({
  selector: 'app-bluetooth',
  templateUrl: './bluetooth.component.html',
  styleUrls: ['./bluetooth.component.scss'],
})
export class BluetoothComponent implements OnInit, OnDestroy {

  private response: Observable<Array<any>>;
  
  // Bonding with html
  private connectionInfo;
  private devicesFound;

  constructor

  ( private bluetoothService: BluetoothService,
    private http: HttpClient,
    private bridgeService: BridgeService,
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

      this.bluetoothService.ble.getConnectionInfo().subscribe((connectionInfo) => {this.ngZone.run( () => {
        this.connectionInfo = connectionInfo;
      });},
      (err) => console.error("this.bluetoothService.ble.getConnectionInfo() error", err));

  }, 
  (err) => console.error("this.bluetoothService.ready() error", err));
  }

  disconnect(){
    this.bluetoothService.ble.disconnect();//.subscribe(connectionInfo => console.log("connectionInfo on disconnect:: ", JSON.stringify(connectionInfo)));
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

  sendMessage(){
    //let message = JSON.stringify({auth: "authCode", code: String(432)});
    this.bridgeService.authoriseOrder(100).subscribe(res => console.log("Authorizing order status: ", res));
    //this.bluetoothService.ble.order(message).subscribe(response => console.log("got response: ", response));
  }

  check(){
     // TO BE DELETED
     //let sha256 = new SHA();
     //sha256.generate();

    this.bridgeService.authoriseOrder(100).subscribe(res => console.log("Authorizing order status: ", res));
    console.log("Checked");

  }
  startScan(){
    this.bluetoothService.ble.startScanning();
  
  }
  
  connect(dvc_address: string){
      this.bluetoothService.ble.connect(dvc_address);

  }



 

}
