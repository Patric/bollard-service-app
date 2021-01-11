import { Injectable } from '@angular/core';
import { BluetoothLE, DeviceInfo} from '@ionic-native/bluetooth-le/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable, Observer, of, Subject, throwError } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { peripheral } from '../config/bluetooth.config.json'
import { BluetoothAbstract, STATUS } from './bluetooth-abstract';


@Injectable({
  providedIn: 'root'
})
export class BluetoothNativeService implements BluetoothAbstract{

  //UID in AAAA format, not AxAAAA
  private PRIMARY_SERVICE_UID = peripheral.service.UUID.substring(2);

  connectionInfo$: BehaviorSubject<{address: string,name: string, status: STATUS}>;
  devicesFound: Array<any>;
  devicesFound$: BehaviorSubject<Array<any>>;
 
  response$: Subject<any>;

constructor(
  public bluetoothle: BluetoothLE, 
  public plt: Platform) {
  this.devicesFound = new Array();
  this.devicesFound$ = new BehaviorSubject<Array<any>>(this.devicesFound);
  this.connectionInfo$ = new BehaviorSubject<{address: string,name: string, status: STATUS}>({address: null, name: null, status: STATUS.DISCONNECTED});

  this.response$ = new Subject<any>();
  this.plt.ready().then((readySource) => {
    console.log('Platform ready from', readySource);
    
    this.bluetoothle.hasPermission().then((response) => {
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


getConnectionInfo(): Observable<{address: string,name: string, status: STATUS}> {
  return this.connectionInfo$.asObservable();
}

getDevicesFound(): Observable<Array<any>>{
  return this.devicesFound$.asObservable();
}
  
  checkStatus(){
    console.log("CHECK");
  }


  // read(){
  //   console.log("reading...", this.connectionInfo$.getValue());
  //   this.bluetoothle.subscribe({
  //     "address": this.connectionInfo$.getValue().address,
  //     "service": this.PRIMARY_SERVICE_UID,
  //     "characteristic": this.PRIMARY_CHARACTERISTIC_UID
  //   }).subscribe((onfulfilled) => 
    
  //   {let value = onfulfilled.value;
  //     if(value != undefined){
  //       this.message$.next(atob(value));
  //     } 
  //   });
  // }

  debugButton(){}

 
  // INTERFACE BLUETOOTHABSTRACT =====================================================================================
  startScanning(): Observable<{address: string,name: string, status: STATUS}>{
   
    this.bluetoothle.isScanning().then((status) => {
      console.log("Is scanning =", status.isScanning);

    if(!status.isScanning){
    this._superviseScan();
    this.devicesFound = [];
    // Add currently connected device
    if(this.devicesFound.find(device => device.address == this.connectionInfo$.value.address) || this.connectionInfo$.value.address == null){
      // do nothing
    }
    else{
      this.devicesFound.push(this.connectionInfo$.value);
    }
   
    console.log("Devices found:", this.devicesFound);

    this.bluetoothle.startScan({
      //"services": [this.PRIMARY_SERVICE_UID], // bugs when connecting to different devices or services
      "allowDuplicates": true,  
      "scanMode": this.bluetoothle.SCAN_MODE_LOW_LATENCY,
      "matchMode": this.bluetoothle.MATCH_MODE_AGGRESSIVE,
      "matchNum": this.bluetoothle.MATCH_NUM_MAX_ADVERTISEMENT,
      "callbackType": this.bluetoothle.CALLBACK_TYPE_ALL_MATCHES,
    }).subscribe((deviceInfo) => {
        
      // Avoid duplicates during 2 secs scan
      if(deviceInfo.status == "scanResult"){
        if(this.devicesFound.find(x => x.address == deviceInfo.address && x.name == deviceInfo.name)){}
        else{
          this.devicesFound.push(deviceInfo);
        };
      }
      this.devicesFound$.next(this.devicesFound);
    });
   }
  });

    return this.connectionInfo$.asObservable();

  }

  connect(dvc_address: string)
  {
    if(this.connectionInfo$.value.status == STATUS.DISCONNECTED){
      this.connectionInfo$.next({address: null, name: null, status: STATUS.CONNECTING});
      console.log("Connecting initiated");
      this.bluetoothle.connect(
        {
          address: dvc_address,
          autoConnect: false
        }
      ).subscribe((deviceInfo) =>  {
      if(deviceInfo.status == "connected"){
        this.bluetoothle.discover({
          "address": deviceInfo.address,
          "clearCache": true
        }).then((onfulfilled) => {
          this.connectionInfo$.next({address: deviceInfo.address, name: deviceInfo.name, status: STATUS.CONNECTED});
          this.bluetoothle.mtu({address: this.connectionInfo$.getValue().address, mtu: 242}).then(onfullfilled => {
            console.log("MTU SET ", JSON.stringify(onfullfilled));
        
           this._watchResponsesFrom(peripheral.characteristic.response.substring(2), peripheral.characteristic.status.substring(2))
           .subscribe(val => this.response$.next(val));
          });
    
          console.log("Services: ", JSON.stringify(onfulfilled.services));
      });
      }
      else if(deviceInfo.status == "closed"){
        this.connectionInfo$.next({address: null, name: null, status: STATUS.DISCONNECTED});
      };
      
      }, (err) => 
      {
        if(err.message == "Device previously connected, reconnect or close for a new device"){
        
          this.bluetoothle.close({
            address: err.address
            }).then((onfullfilled) => {
              console.log(onfullfilled);
              if(onfullfilled.status == "closed"){
                this.connect(dvc_address);
              }
            }
            );;
  
        console.error("Function connect() failed: ", err);
      }
      }
      );
    }
    else{
      console.error("Device ", JSON.stringify(this.connectionInfo$.value), " already connected. Disconnect to this device to establish a new connection");
    }
  }


  order(body: string): Observable<any>{

    this.bluetoothle.write({address: this.connectionInfo$.value.address,
    service: this.PRIMARY_SERVICE_UID,
    characteristic: peripheral.characteristic.order.substring(2),
    value: this.bluetoothle.bytesToEncodedString(this.bluetoothle.stringToBytes(body))
    }).then(response => console.log("WROTE: ", JSON.stringify(response)));
    //alternatively first(response => response.header == orderhearder)
    return this.response$.pipe(take(1));
  }

  // sendMessage(code: number): Observable<any>{
   
  //   this._writeValue(212).subscribe(res => console.log("response is ", res));
  //   // let message = JSON.stringify({auth: "authCode", code: "433"});
  //   // this.bluetoothle.write({address: this.connectionInfo$.value.address,
  //   // service: this.PRIMARY_SERVICE_UID,
  //   // characteristic: peripheral.characteristic.order.substring(2),
  //   // value: this.bluetoothle.bytesToEncodedString(this.bluetoothle.stringToBytes(message))
  //   // }).then(response => console.log("WROTE: ", JSON.stringify(response)));

  //   //   return this.response$.pipe(take(1));
  //   return of(null);
  // }

  
  disconnect(): Observable<{address: string,name: string, status: STATUS}>{
    console.log("Disconnecting...");
    this.bluetoothle.disconnect(
      {
      address: this.connectionInfo$.value.address
      }
    )
    .then((deviceInfo) =>  
      {
        this.bluetoothle.close(
          {
            address: this.connectionInfo$.value.address
          }
        ).then((deviceInfo) =>  
          {
          this.connectionInfo$.next({address: null, name: null, status: STATUS.DISCONNECTED});
          console.log("Connection closed");
          }
        );
      })
    .catch(onrejected => {
        this.bluetoothle.isConnected({address: this.connectionInfo$.value.address}).then((deviceInfo) =>{   
          if(!deviceInfo.isConnected){
            this.connectionInfo$.next({address: null, name: null, status: STATUS.DISCONNECTED});
          }   
          console.error(JSON.stringify(onrejected));
    });

      });;


    return this.connectionInfo$.asObservable();
  }

  //helper functions

  
  // for debug
  // _writeValue(code): Observable<any>{
   
  //   let message = JSON.stringify({auth: "authCode", code: "433"});
  //   this.bluetoothle.write({address: this.connectionInfo$.value.address,
  //   service: this.PRIMARY_SERVICE_UID,
  //   characteristic: peripheral.characteristic.order.substring(2),
  //   value: this.bluetoothle.bytesToEncodedString(this.bluetoothle.stringToBytes(message))
  //   }).then(response => console.log("WROTE: ", JSON.stringify(response)));

  //     return this.response$.pipe(take(1));
  // }


  _readValue$(characteristicUID: string){
    return this.bluetoothle.subscribe({
      "address": this.connectionInfo$.getValue().address,
      "service": this.PRIMARY_SERVICE_UID,
      "characteristic": characteristicUID,
    });
  
  }

  _readValue(characteristicUID: string){

    return this.bluetoothle.read({
      "address": this.connectionInfo$.getValue().address,
      "service": this.PRIMARY_SERVICE_UID,
      "characteristic": characteristicUID,
    });
  }


  _watchResponsesFrom(characteristicUID: string, statusCharacteristicUID: string){
    const subject$ = new Subject<any>()

    this._readValue$(statusCharacteristicUID).subscribe(operationResult =>{
      let val = operationResult.value;
      if(val != undefined){
        val = atob(val);
      }
      if(val == "Written" && val != undefined){
        this._readValue(characteristicUID).then(onfullfilled => {
          let value = onfullfilled.value;
          if(value != undefined){
            value = atob(value);
            subject$.next(value);
          }
        })
      }
    });
  
    return subject$.asObservable();
    
  }


  // Ensure device is not scanning all the time. Check after 2 seconds from the scanning start
  _superviseScan(){
    const seconds = 2;
    const interval_id = setInterval(() => {
      this.bluetoothle.isScanning().then((status) => {

        if(status.isScanning){
          this._stopScanning();
        }
        else{
          console.log("Interval for isScanning stopped");
          clearInterval(interval_id);
        }
      });
      // miliseconds
    }, 1000*seconds);
  }


  _stopScanning(){
    
    this.bluetoothle.isScanning().then((status) => {
      if(status.isScanning){
        this.bluetoothle.stopScan().then(m => console.log("Stopped scanning ", m));

      };
    });


  }

  _error(message: string){
    return throwError ({error: { message }})
  }

 // bollard sending to device it's data. Device making request to serwer to get data for this bollard
  

}
