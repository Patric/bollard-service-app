import { DatePipe, formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { BluetoothLE, ScanStatus } from '@ionic-native/bluetooth-le/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable, Observer, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class BluetoothService {

  scanStatus: ScanStatus;
  devicesFound: Array<any>;
  devicesFoundObs: Observable<Array<any>>;

constructor(public bluetoothle: BluetoothLE, public plt: Platform) {

  

  this.devicesFound = new Array();


  console.log("Initiating bluetooth");
  this.plt.ready().then((readySource) => {
 

    console.log('Platform ready from', readySource);
    
    this.bluetoothle.hasPermission().then((response) => {
      //console.log(response);
      if(response.hasPermission == false){

        this.bluetoothle.requestPermission().then(status => console.log(status));

      }
        


    });

    bluetoothle.isLocationEnabled().then((isLocationEnabled) => {
      console.log(isLocationEnabled);
      if(!isLocationEnabled){
        this.bluetoothle.requestLocation().then(status => console.log(status));
      }

    });
    this.bluetoothle.initialize({
      "request": true, // request = true / false (default) - Should user be prompted to enable Bluetooth
      "statusReceiver": true, // Should change in Bluetooth status notifications be sent.
      "restoreKey" : "bluetoothleplugin" // A unique string to identify your app. Bluetooth Central background mode is required to use this, but background mode doesn't seem to require specifying the restoreKey.
      
    }).subscribe(ble => {
      console.log('ble', ble.status) // logs 'enabled'
      this.bluetoothle.enable();
      this.bluetoothle.getAdapterInfo().then(info => console.log(info));
    });


    
   });
 }


  checkStatus(){
    console.log('FOUND DEVICES: ', this.devicesFound);
  }
  startScan(){
    this.devicesFound = [];
    console.log(this.devicesFound);
    const stop_scan = new Date();
    stop_scan.setSeconds(stop_scan.getSeconds() + 2);

    
    this.bluetoothle.startScan({
     // "services": ["1101"],
      "allowDuplicates": true,  
      "scanMode": this.bluetoothle.SCAN_MODE_LOW_LATENCY,
      "matchMode": this.bluetoothle.MATCH_MODE_AGGRESSIVE,
      "matchNum": this.bluetoothle.MATCH_NUM_MAX_ADVERTISEMENT,
      "callbackType": this.bluetoothle.CALLBACK_TYPE_ALL_MATCHES,
    }).subscribe((status) => {
      

      const myDate = new Date();
      if(myDate.toString().substring(11, 30) == stop_scan.toString().substring(11,30)){
        this.stopScan();
      }

      //console.log("New status: ", status);
      if(status.status == "scanResult"){
        if(this.devicesFound.find(x => x.address == status.address && x.name == status.name)){}
        else{
          this.devicesFound.push(status);
          
        };
      }
      else{
        
      }
      //return of(this.devicesFound);
    }
    );
  }

  stopScan(){
    this.bluetoothle.stopScan().then(m => console.log(m));
    // this.bluetoothle.connect(
    //   {address: "3C:71:BF:CB:3B:EE"}).subscribe(deviceInfo => console.log(deviceInfo));
  }

  getDevicesFound(): Observable<Array<any>>{
    return of(this.devicesFound);
  }
 
  

}
