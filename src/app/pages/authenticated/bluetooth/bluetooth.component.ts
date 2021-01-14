import { HttpClient } from '@angular/common/http';
import { Component, Injector, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../_services/auth.service';

import { environment } from '../../../../environments/environment';

import { BluetoothService } from '../../../_services/bluetooth/bluetooth.service';
import { Observable } from 'rxjs';
import {BridgeService} from '../../../_services/bridge.service'


@Component({
  selector: 'app-bluetooth',
  templateUrl: './bluetooth.component.html',
  styleUrls: ['./bluetooth.component.scss']
  
})
export class BluetoothComponent implements OnInit, OnDestroy {

  private response: Observable<Array<any>>;
  
  //isNaN: Function = Number.isNaN;
  // Bonding with html
  private connectionInfo; 
  private devicesFound;
  private deviceResponse;
  //@Input() code: String;//bou


  constructor

  ( private bluetoothService: BluetoothService,
    private http: HttpClient,
    private bridgeService: BridgeService,
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone,
    private injector: Injector
  ) {
    this.ngZone.run( () => {
      this.connectionInfo = {address: null, name: "null", status: "DISCONNECTED"};
    });

  }

  ngOnDestroy(): void {

    console.log("ON DESTROY CALLED");
    //this.disconnect();
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
        if(connectionInfo.status == "CONNECTED"){
          this.deviceResponse = null;
        }

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

  sendMessage(code: String){
  
      this.bridgeService.authoriseOrder(Number(code)).subscribe(res =>{
        console.log("Authorizing order status: ", res);
        res = JSON.stringify(JSON.parse(res), null, 2);
        res = res.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        this.ngZone.run( () => {this.deviceResponse = res;});
      })

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

  isEmpty(input): Boolean{
    if(String(input).length > 0){
      return false;
    }
    return true;
  }

  ionViewWillLeave() {
    console.log("Looks like I'm about to leave :(");
  }
 

}
